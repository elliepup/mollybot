const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Apply a filter to the queue.'),
  async execute(interaction) {

    await interaction.reply({
        content: "This command is currently under development.",
    })
    
  }
}