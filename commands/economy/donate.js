const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Users, getTieredCoins } = require('../../models/Users')

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

        if(amount <= 0) return interaction.reply({
            content: "Please enter a valid number of coins to donate.",
            ephemeral: true,
        })
        if(donor == target) return interaction.reply({
            content: "You can't donate to yourself.",
            ephemeral: true,
        })
        
        const donorData = await Users.findOne({userId: donor.id}) || await Users.create({userId: donor.id});
        const targetData = await Users.findOne({userId: target.id}) || await Users.create({userId: target.id});

        const donorBalance = await donorData.balance;

        if(amount > donorBalance) return interaction.reply({
            content: "You don't have that many coins to donate!",
            ephemeral: true,
        })

        await donorData.updateOne({$inc: {balance: -1 * amount, totalDonated: amount}})
        await targetData.updateOne({$inc: {balance: amount}})

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle("💵 Donation complete 💵")
                .setColor('4ADC00')
                .setDescription(`**${donor.username}** has donated ${getTieredCoins(amount)} to **${target.username}**!`)
                .setFooter("Just ignore the fact that there's no confirmation system implemented.")
            ]
        })
    }

}
