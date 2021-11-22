//Molly Bot Revamped
//Nicholas Tabb
//Started 11/18/2021
//Previous Molly Bot was super scuffed so now I'm trying again :')


require('dotenv').config();
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const { bold } = require('@discordjs/builders');
const { Player } = require('discord-player');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });
const player = new Player(client);

module.exports = { player, client }; 
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
client.commands = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (file of commandFiles) {
		const command = require(`../commands/${folder}/${file}`);
		client.commands.set(command.data.name, command);
	}
}

client.login(process.env.TOKEN);

