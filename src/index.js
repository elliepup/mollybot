//Molly Bot [Revamped] -Rewritten
//Nicholas, Nathan Tabb
//Started 11/12/2022
//Molly Bot [Revamped], but music commands will hopefully not break randomly again

require('dotenv').config();
const fs = require('node:fs');

const discord = require('discord.js');
const { Player } = require('discord-player')

//client object with intents
const client = new discord.Client({
    intents: ["Guilds", "GuildVoiceStates", "GuildMessages", "MessageContent"]
});

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

//event handling
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

//command handling
client.commands = new discord.Collection();
const commandFolders = fs.readdirSync('./commands');
for (folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

client.login(process.env.TOKEN);