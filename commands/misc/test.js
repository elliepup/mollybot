const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('A command for testing stuff.'),
  async execute(interaction) {

    const embedsToGenerate = 5;
    const embeds = [];
    for (let i = 0; i < embedsToGenerate; i++) {
        embeds.push(new EmbedBuilder()
            .setTitle(`Embed ${i + 1}`)
            .setDescription(`This is embed ${i + 1} of ${embedsToGenerate}.`)
            .setColor('#82E4FF')
        );
        }
    

    const buttonPagination = require('../../functions/pagination.js');
    buttonPagination(interaction, embeds);
  }
}