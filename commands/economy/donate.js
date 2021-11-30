const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Users = require('../../models/Users')

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

        await donorData.updateOne({$inc: {balance: -1 * amount}})
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

//function was created early in my programming career. despite looking absolutely disgusting, it works perfectly fine :) 
function getTieredCoins(balance) {
    const emotes = ['<:YukiPlat:872106609399169025>', '<:YukiGold:872106598527541248>',
        '<:YukiSilver:872106587861417994>', '<:YukiBronze:872106572275392512>']

    const platValue = 1000000,
        goldValue = 10000,
        silverValue = 100;

    const platinum = Math.floor(balance / platValue)
    const gold = Math.floor((balance - platinum * platValue) / goldValue)
    const silver = Math.floor((balance - platinum * platValue - gold * goldValue) / silverValue)
    const bronze = Math.floor((balance - platinum * platValue - gold * goldValue - silver * silverValue))

    const values = [platinum, gold, silver, bronze];

    var formattedString = "";
    for (let i = 0; i < values.length; i++) {
        if (values[i] != 0) formattedString += `\`${values[i]}\` ${emotes[i]} `
    }
    return formattedString;

}