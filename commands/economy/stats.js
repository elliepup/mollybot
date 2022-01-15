const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getTieredCoins, getEconProfile } = require('../../extras/econFunctions')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays the stats of the target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose stats you want to see.')
                .setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser("target") || interaction.user;
        const userId = target.id;

        if(target.bot) return interaction.reply({
            content: "Please specify a real person instead of a bot.",
            ephemeral: true
        })

        var econProfile = await getEconProfile(userId);

        

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`${target.username}'s global stats`)
                .setColor(`#8800FF`)
                .addField(`Coinflip Stats`, `**Total coinflipped:** ${getTieredCoins(econProfile.totalCoinflipped)}\n**Times coinflipped:** \`${econProfile.timesCoinflipped}\``
                + `\n**Coinflips won:** \`${econProfile.coinflipsWon}\`\n**Coinflips lost:** \`${econProfile.coinflipsLost}\`\n**Win percentage:** `+ 
                `\`${(econProfile.coinflipsWon == 0) ? 0 : (econProfile.coinflipsWon/(econProfile.coinflipsWon + econProfile.coinflipsLost) * 100)}%\`\n**Winnings from conflips:** ` +
                `${getTieredCoins(econProfile.winningsFromCoinflips)}`, false)
                .addField(`Other Stats`, `**Total donated:** ${getTieredCoins(econProfile.totalDonated)}\n**Coins from working:** ${getTieredCoins(econProfile.coinsFromWorking)}\n`
                +`**Times worked:** \`${econProfile.timesWorked}\``, false)
            ]
        })
    }

}