const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');
const buttonPagination = require('../../functions/pagination.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top 100 users in the economy unless a number is specified.')
    .addIntegerOption(option => option.setName('number').setDescription('The number of users to display.')),
  async execute(interaction) {

    const number = interaction.options.getInteger('number') || 100;
    const maxItemsPerPage = 10;
    const { data } = await interaction.client.supabase
      .from('economy_profile')
      .select('user_id, balance')
      .order('balance', { ascending: false })
      .limit(number);

      //split data into pages 
      const pages = [];
      for (let i = 0; i < data.length; i += maxItemsPerPage) {
          const current = data.slice(i, i + maxItemsPerPage);
          pages.push(current);
      }

      //create embeds for each page
      const embeds = [];
      for (let i = 0; i < pages.length; i++) {
          const embed = new EmbedBuilder()
              .setTitle(`Top ${number} Users`)
              .setColor("#82E4FF")
              .setDescription(`${blockQuote(pages[i].map((user, index) => `${index + 1}. <@${user.user_id}> - ${getTieredCoins(user.balance)}`).join('\n'))}`)
              .setFooter({ text: `Page ${i + 1} of ${pages.length}`, iconURL: interaction.user.displayAvatarURL() })
          embeds.push(embed);
      }

      //send embeds
      buttonPagination(interaction, embeds);   
        
    
  }
}