const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestcatch')
        .setDescription('Displays the best catch for the day and the best catch of all time'),
    async execute(interaction) {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Not yet implemented!`)
                    .setColor(`#FF0000`)
                    .setDescription(`This command is not yet implemented! Please check back later! If you have any suggestions, please DM me.`)
            ]
        })
    }
}