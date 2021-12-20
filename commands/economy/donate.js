const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Gives the @mention a specified amount of coins.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('The amount you wish to donate.')
                .setRequired(true)),
    async execute(interaction) {

        
    }

}
