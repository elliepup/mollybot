const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../functions/pagination.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stocks')
        .setDescription('Displays the collection of stocks you or another user has.')
        .addUserOption(option => option.setName('user').setDescription('The user to view the collection of.').setRequired(false))
        .addStringOption(option =>
            option.setName('sort')
              .setDescription('Optionally sort the collection by one of these options.')
              .setRequired(false)
              .setAutocomplete(true)),
        autocompleteOptions: ['value', 'alphabetical'],
    async execute(interaction) {

        const target = interaction.options.getUser('user') || interaction.user;

        const { data, error } = await interaction.client.supabase
            .rpc('get_stocks_by_owner', {
                user_id_in: target.id
            })
    
        if (error) {
            return interaction.reply({
                content: `There was an error retrieving the data!`,
                ephemeral: true
            })
        }

        if (data.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No stocks")
                        .setDescription(`${target.username} currently has no stocks. In order to get stocks, use the /buystock command.`)
                ]
            })
        }

        let averagePrices = getAveragePrices(data);
        let sortOption = interaction.options.getString('sort');
        if (sortOption) {
            switch (sortOption) {
                case 'value':
                    averagePrices = Object.fromEntries(Object.entries(averagePrices).sort(([,a],[,b]) => b-a));
                    break;
                case 'alphabetical':
                    averagePrices = Object.fromEntries(Object.entries(averagePrices).sort());
                    break;
            }
        }

        const pages = [];
        const maxStocksPerPage = 8;

        let entries = Object.entries(averagePrices);
        for (let i = 0; i < entries.length; i += maxStocksPerPage) {
            const current = entries.slice(i, maxStocksPerPage + i);
            pages.push(new EmbedBuilder()
                .setColor('#03fc84')
                .setTitle(`📈 Average Stock Prices 📉`)
                .setDescription(`Stocks owned by <@${target.id}>`)
                .setFields({
                    name: `Total Stocks: ${entries.length}`, 
                    value: current.map(([ticker, avgPrice]) => {
                        let output = "";
                        output += '`' + ticker + '` · '; // ticker
                        output += `${getTieredCoins(Math.ceil(avgPrice))}`; // average price
                        return output;
                    }).join('\n')
                })
            );
        }

        buttonPagination(interaction, pages);
    }
    
}

// Function to get the average price of each stock
// Sorts the data by ticker, then averages the purchase prices (dollar cost averaging)
function getAveragePrices(data) {
    const sumsCounts = {};
  
    data.forEach(item => {
      // If this is the first time we've seen this ticker, initialize it in the object.
      if (!sumsCounts[item.ticker]) {
        sumsCounts[item.ticker] = {
          sum: item.purchase_price,
          count: 1
        };
      } else {
        // Otherwise, add to the sum and increment the count.
        sumsCounts[item.ticker].sum += item.purchase_price;
        sumsCounts[item.ticker].count += 1;
      }
    });
  
    const averages = {};
  
    for (const ticker in sumsCounts) {
      averages[ticker] = sumsCounts[ticker].sum / sumsCounts[ticker].count;
    }
    return averages;
}
