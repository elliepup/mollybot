const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Users, getTieredCoins } = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays the stats of a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose stats you want to see.')
                .setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser("target") || interaction.user;
        const userData = await Users.findOne({userId: target.id}) || await Users.create({userId: target.id});

        const embed = new MessageEmbed()
        .setColor('C54EFF')
        .setTitle(`${target.username}'s global stats`)
        .setDescription(`**Coins earned from typing:** ${getTieredCoins(userData.coinsFromTalking)}\n**Total coins coinflipped:** ` +
        `${getTieredCoins(userData.totalCoinflipped)}\n**Total winnings from coinflips:** ${getTieredCoins(userData.winningsFromCoinflips)}` +
        `\n**Total donated:** ${getTieredCoins(userData.totalDonated)}\n**Coins from working:** ${getTieredCoins(userData.totalWorked)}`)
        .setFooter("More stats coming soon! If you have any recommendations, DM me!")
        

        interaction.reply({embeds: [embed]})
    }

}