const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed, Message } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of Molly Bot commands.'),
    async execute(interaction) {

        const embed = new MessageEmbed()
            .setColor('00DEFF')
            .setTitle('🎶 Molly Bot Commands 🎶')
            .setDescription(quote(`There currently are no commands. Due to ${bold(`pseudolegendary nick#0021's`)} small brain, it probably won't be for a while until commands are added.`))
            .setFooter('Molly Bot is intended to be a music/utility bot.')

        await interaction.reply({ embeds: [embed] })
    }

}