module.exports = (client) => {
    const discord = require('discord.js');
    const fs = require('node:fs');
    client.commands = new discord.Collection();
    const commandFolders = fs.readdirSync('./commands');
    for (folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        for (file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            client.commands.set(command.data.name, command);
        }
    }
}