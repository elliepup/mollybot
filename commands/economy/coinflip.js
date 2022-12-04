const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('High risk, high reward fun!')
        .addIntegerOption(option => option.setName('bet').setDescription('The amount of coins to bet').setRequired(true)),
    async execute(interaction) {

        const { money: data } = await interaction.client.supabase
            .rpc('get_balance', {
                user_id_in: interaction.user.id
            })

        const bet = interaction.options.getInteger('bet');

        console.log(side);
        if (bet > data) {
            return interaction.reply({
                content: `You don't have enough coins to bet that amount!`,
                ephemeral: true
            })
        }

        
    }
}