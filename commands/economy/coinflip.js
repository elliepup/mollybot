const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('High risk, high reward fun!')
        .addIntegerOption(option =>
            option.setName('bet')
            .setDescription('The amount of coins to bet')
            .setRequired(true)
        ),

    /**
     * Executes a betting game for a user.
     *
     * @param {Interaction} interaction - The interaction object with the user.
     * @return {Promise} A promise that resolves with the game result.
     */
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        
        const balanceResponse = await interaction.client.supabase
            .rpc('get_balance', { user_id_in: user.id });

        let money = balanceResponse.data;
        const bet = interaction.options.getInteger('bet');

        // Checking if user has enough balance to bet
        if (bet > money) {
            return interaction.reply({
                content: `You don't have enough coins to bet that amount!`,
                ephemeral: true
            });
        }

        await interaction.client.supabase
        .rpc('increment_total_coinflipped', { user_id_in: user.id, amount_in: bet });
        
        const taxBrackets = [
            { min: 0, max: 1000, rate: 0.1 },
            { min: 1001, max: 5000, rate: 0.2 },
            { min: 5001, max: 10000, rate: 0.3 },
            { min: 10001, rate: 0.4 },
          ];
          
          // Helper function to calculate tax based on winnings.
          function calculateTax(winnings) {
            let tax = 0;
          
            for (let bracket of taxBrackets) {
              if (winnings > bracket.min && (bracket.max === undefined || winnings <= bracket.max)) {
                tax = winnings * bracket.rate;
                break;
              }
            }
          
            return tax;
          }
          
          const coinflip = Math.floor(Math.random() * 2);
          const rawWinnings = coinflip == 1 ? bet : -bet;
          let netWinnings = rawWinnings;
          if(coinflip){ 
            await interaction.client.supabase
            .rpc('increment_times_coinflipped', { user_id_in: user.id, acount_in: 1 });

            const tax = calculateTax(Math.max(rawWinnings, 0)); // Deducting tax only if user won
            netWinnings = rawWinnings - tax;
            await interaction.client.supabase
            .rpc('add_player_balance', { user_id_in: 'mollybot id', acount_in: tax });
          }

          money += netWinnings;
          
          await interaction.client.supabase
            .rpc('add_player_balance', {
              user_id_in: interaction.user.id,
              amount_in: netWinnings
            });
          
          return interaction.reply({
            content: `You have ${coinflip == 1 ? "won" : "lost"} ${getTieredCoins(Math.abs(netWinnings))}! Your new balance is ${getTieredCoins(money)}!`,
          });
    }
}
