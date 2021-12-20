const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription(`Risk some coins on a single coinflip.`)
        .addIntegerOption(option =>
            option.setName('wager')
                .setDescription('The amount you wish to wager.')
                .setRequired(true)),
    async execute(interaction) {

        
    }
}
