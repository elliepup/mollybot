const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays a list of commands to the user.'),
  async execute(interaction) {

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Molly Bot Commands")
          .setColor("#82E4FF")
          .setDescription(`${blockQuote("Molly Bot **[REVAMPED]** is current in the early stages of development. DM bugs/suggestions to **pseudolegendary nick#0021**.")}`)
          .addFields(
              {name: 'Music', value: codeBlock("disconnect\nfilter\njump\npause\nplay\nplaying\nqueue\nresume\nshuffle\nskip\nskipto\nstop")},
              {name: 'Fishing', value: codeBlock("fish")},
          )
      ]
    })
  }
}