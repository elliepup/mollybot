const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewstocks')
    .setDescription('View stonks')    
    .addStringOption(option => option.setName('stock').setDescription('Stock to view').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const stock = interaction.options.getString('stock') || interaction.stock;
    
    const options = {
      method: 'GET',
      url: process.env.TWELVEDATA_URL,
      params: {
        symbol: stock,
        interval: '30min',
        apikey: process.env.TWELVEDATA_KEY,
      }
    };

    const stockLength = 8;
  
    try {
      const response = await axios.request(options);
      const timeSeriesData = response.data.values;
    
      if (!timeSeriesData || timeSeriesData.length < stockLength) {
        const embed = new EmbedBuilder()
          .setColor('Red')
          .setTitle('Stock Search Error')
          .setDescription(`${stock.toUpperCase()} not found`);
        return interaction.reply({ embeds: [embed] });
      }
    
      const latestEightData = timeSeriesData.slice(0, 8);
      const closePrices = latestEightData.map(data => parseFloat(data.close));
      const highestClosePrice = Math.max(...closePrices);
      const lowestClosePrice = Math.min(...closePrices);
      //const averageClosePrice = closePrices.reduce((a, b) => a + b, 0) / closePrices.length;
      
      const description = latestEightData.map((data) => {
        const timeStamp = new Date(data.datetime).toLocaleTimeString(); // gets only the time part of the Date object
        let status = '';
        if (parseFloat(data.close) === highestClosePrice) status = "🔺 Highest";
        if (parseFloat(data.close) === lowestClosePrice) status = "🔻 Lowest";
        data = parseFloat(data.close).toFixed(2);
        return `${timeStamp}: $${data} ${status}`;
      }).join("\n");
  
      interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle(stock.toUpperCase())
            .setColor("#82E4FF")
            .setDescription(`**Stock Viewer**\n${blockQuote(description)}`)
            .setFooter({ text: `Experimental Command`, iconURL: user.displayAvatarURL() })
        ]
    })
      
    } catch (error) {
      console.error(error);
    }
  
  }
}