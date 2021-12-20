const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed, MessageButton } = require('discord.js')
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See everyone ranked by wealth!'),
    async execute(interaction) {

        
    }

}
