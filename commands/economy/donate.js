const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getTieredCoins, getBalance, updateBalance, updateEconAttribute } = require('../../extras/econFunctions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Gives the @mention a specified amount of coins.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount you wish to donate.')
                .setRequired(true)),
    async execute(interaction) {

        const donor = interaction.user;
        const target = interaction.options.getUser("target");

        const amount = interaction.options.getInteger("amount");
        if (donor == target) return interaction.reply({
            content: "You cannot donate to yourself!",
            ephemeral: true
        })

        if (target.bot) return interaction.reply({
            content: "You cannot donate to a bot!",
            ephemeral: true
        })
        if (amount <= 0) return interaction.reply({
            content: "Please enter a valid number of coins to donate.",
            ephemeral: true
        })

        const userBalance = await getBalance(donor.id);
        if (userBalance < amount) return interaction.reply({
            content: `The amount you wish to donate exceeds your current balance of ${getTieredCoins(userBalance)}.`,
            ephemeral: true
        })

        await updateBalance(donor.id, -1 * amount);
        await updateBalance(target.id, amount);

        await updateEconAttribute(donor.id, "totalDonated", amount)
        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle("💵 Donation complete 💵")
                    .setColor('4ADC00')
                    .setDescription(`**${donor.username}** has donated ${getTieredCoins(amount)} to **${target.username}**!`)
                    .setFooter({ text: "Just ignore the fact that there's no confirmation system implemented." })
            ]
        })
    }

}
