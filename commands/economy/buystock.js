const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buystock')
        .setDescription('Purchase stocks')
        .addStringOption(option => option.setName('ticker').setDescription('Ticker of stock to buy').setRequired(true))
        .addIntegerOption(option => option.setName('count').setDescription('The number of shares to purchase').setRequired(true)),
    async execute(interaction) {

        const stock = interaction.options.getString('ticker').toUpperCase();
        const count = interaction.options.getInteger('count');

        let cost;
        let balanceInDollars;

        let closingValue;

        if (count < 1) {
            return interaction.reply({
                content: `You can't buy less than 1 stock!`,
                ephemeral: true
            })
        }

        const options = {
            method: 'GET',
            url: process.env.TWELVEDATA_URL,
            params: {
              symbol: stock,
              interval: '1day',
              outputsize: 1,
              apikey: process.env.TWELVEDATA_KEY,
            }
          };
          
          let showNotFound = () => {
            return interaction.reply({
                content: `Stock ${stock} not found!`,
                ephemeral: true
            })
            }
        
            async function fetchStockData() {
                try {
                    const response = await axios.request(options);
                    const data = response.data;
                    if (data && data.values && data.values.length > 0) {
                        const mostRecentData = data.values[0];
                        return mostRecentData.close;
                    } else {
                        showNotFound();
                    }
                } catch (error) {
                    showNotFound();
                }
            }
            
            const fetchUserBalance = async () => {
                const { data } = await interaction.client.supabase
                    .rpc('get_balance', {
                        user_id_in: interaction.user.id
                    });
                return data;
            };
            
            async function execute() {
                closingValue = await fetchStockData();
                const balance = await fetchUserBalance();
            
                balanceInDollars = balance / 100; // balance is in cents, it needs to be converted to dollars
                cost = count * closingValue;
                noErrors = balanceInDollars && cost;
                return noErrors;
            }
        
        let valid = await execute(); // pretty bad hack, but it works
        if (!valid) {
            return;
        }

        if (cost > balanceInDollars) {
            return interaction.reply({
                content: `You don't have enough coins to buy that many stocks!`,
                ephemeral: true
            })
        }


        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setEmoji('✔')
            .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setEmoji('✖')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);
        const embed = new EmbedBuilder()
            .setTitle(`${stock} Stock Purchase`)
            .setColor("#82E4FF")
            .setDescription(`${blockQuote(`Are you sure you want to purchase ${count} shares of ${stock} for ${getTieredCoins(Math.ceil(cost))}?`)}`)
            .setFooter({ text: `You can earn coins by using the /work command.`})

        const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        })

        const filter = i => i.customId === 'confirm' || i.customId === 'cancel' && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
        
        collector.on('collect', async i => {

            row.components.forEach((button) => button.setDisabled(true));
            if (i.customId === 'confirm') {

                //confirm user still has enough coins
                let { data } = await interaction.client.supabase
                    .rpc('get_balance', {
                        user_id_in: interaction.user.id
                    })

                if(cost > data) {
                    embed.setDescription(`${blockQuote(`You no longer have enough coins to purchase ${count} shares of ${stock}.`)}`)
                    return i.update({
                        embeds: [embed],
                        components: [row]
                    })
                }
                
                 data = await interaction.client.supabase
                    .rpc('add_player_balance', {
                        user_id_in: interaction.user.id,
                        amount_in: Math.round(cost * -1)
                    })

                await interaction.client.supabase
                .rpc('upsert_stock', {
                    _ticker: stock,
                    _owner: interaction.user.id,
                    _purchase_datetime: new Date(),
                    _purchase_price: closingValue,
                    _quantity: count
                });

                embed.setDescription(`${blockQuote(`You purchased ${count} shares of ${stock} for ${getTieredCoins(Math.ceil(cost))}.`)}`)
                
                i.update({
                    embeds: [embed],
                    components: [row]
                })
                
                return;
            }

            if (i.customId === 'cancel') {
                embed.setDescription(`${blockQuote(`The stock purchase was cancelled. No coins were taken from your wallet.`)}`)
                return i.update({
                    embeds: [embed],
                    components: [row]
                })
            }
            collector.stop();
        }
        )

        collector.on('end', collected => {
            if (collected.size === 0) {
                row.components.forEach((button) => button.setDisabled(true));
                embed.setDescription(`${blockQuote(`The stock purchase was cancelled due to inactivity. No coins were taken from your wallet.`)}`)
                return interaction.editReply({
                    embeds: [embed],
                    components: [row]
                })
            }
        })
    }
}
