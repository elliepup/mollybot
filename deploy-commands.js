const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const guildId = '838957076465582160';
const clientId = '840422136421679104'; //911276391901843476
const token = process.env.TOKEN;

const commands = [];
const commandFolders = fs.readdirSync('./commands');
for (folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for(file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '9' }).setToken(token);

//rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);