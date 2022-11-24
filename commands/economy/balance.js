const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Displays the balance of the user.')
    .addUserOption(option => option.setName('user').setDescription('The user to display the balance of.')),
  async execute(interaction) {

    const user = interaction.options.getUser('user') || interaction.user;
        const { data } = await interaction.client.supabase
        .rpc('get_balance', {
            user_id_in: user.id
        })

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`${user.username}'s Balance`)
                .setColor("#82E4FF")
                .setDescription(`${blockQuote(`${user.username} has ${getTieredCoins(data)} in their wallet.\n\`${data}\`<:YukiBronze:872106572275392512> in total.`)}`)
                .setFooter({ text: `You can earn coins by using the /work command.`, iconURL: user.displayAvatarURL() })
            ]
        })
        
    
  }
}