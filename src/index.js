//mollybot 
//Programmed by Nicholas Tabb
//Started 9/30/21

require('dotenv').config();
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const queue = new Map();
const Keyv = require('keyv');
const prefixes = new Keyv(`sqlite://data/serverData.sqlite`)
prefixes.on('error', err => console.error('Keyv connection error:', err));

module.exports = { queue, prefixes };


//loop to go through command folders/files to create a collection of command 
const commandFolders = fs.readdirSync('./commands');
const globalPrefix = config.defaultPrefix;

for (folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

//initialization of the bot. processes token from environment variable through Heroku and signs in
async function init() {
    const userToken = process.env.TOKEN
    client.login(userToken);

    //initialization of events
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }   
}

//on message received
//may eventually move to the events file but I have to think about how that will affect overall speed given higher workload.
client.on("message", async message => {

    if (message.author.bot) return

    //global and guild-based prefix stuff
    let prefix;
    if (message.content.startsWith(globalPrefix)) prefix = globalPrefix;
     else {
        const guildPrefix = await prefixes.get(message.guild.id);
        if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
    }
    if (!prefix) return;

    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    //cooldown stuff
    //remember to eventually add perms and stuff so idiots can't just ruin servers
    const { cooldowns } = client;
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(0)} more second(s) before using the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        //if the user didn't include any parameters, reply how to use the command
        if (command.args && !args.length) {
            const embed = new Discord.MessageEmbed()
            .setColor('#b30000')
            .setTitle('<:yukinon:839338263214030859> Invalid usage of `' + globalPrefix + command.name + "`")
            .setDescription(`\`\`\`ARM\n${command.usage}\n\`\`\``);
            
            return message.channel.send(embed);
            
        }
        //else execute the command with the message and arguments
        command.execute(message, args);

    } catch (error) {
        
        //creates error embed and sends it to the error channel in my server
        console.error(error);
        const embed = new Discord.MessageEmbed()
        .setColor('#b30000')
        .setTitle('Logged error')
        .addField('Message', message, true)
        .addField('Arguments', args, true)
        .setDescription(error);
        
        const errorChannel = client.channels.cache.get('901186557116039209')
        errorChannel.send(embed);
        message.reply("an error has occurred upon execution.");
    }
})

init();
