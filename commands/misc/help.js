const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of Molly Bot commands.'),
    async execute(interaction) {

        const embed = new MessageEmbed()
            .setColor('00DEFF')
            .setTitle('🎶 Molly Bot Commands 🎶')
            .setDescription("> Molly Bot **[REVAMPED]** is current in the early stages of development. DM bugs/suggestions to **pseudolegendary nick#0021.**")
            .addField('Music', '```diff\nplay [YouTube link/name of song]\nskip\npause\nresume\nqueue```')
            .setFooter('Molly Bot is intended to be a music/utility bot.')

        await interaction.reply({ embeds: [embed] })
    }

}