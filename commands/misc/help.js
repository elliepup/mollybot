const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands to the user.'),
    async execute(interaction) {
        
       interaction.reply({
        embeds: [
            new MessageEmbed()
            .setTitle("hello idiot")
            .setDescription("you are stupid")
            .setColor("AQUA")
        ]
       })
    }

}
