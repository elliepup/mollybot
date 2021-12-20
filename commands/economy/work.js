const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for coins!'),
    async execute(interaction) {

        
    }

}