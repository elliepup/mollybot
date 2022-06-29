const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { EconData } = require('../../models/EconProfile')
const { User, getTieredCoins } = require('../../models/User')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for coins!'),
    async execute(interaction) {

        const userId = interaction.user.id;
        const user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });
        const userEcon = await EconData.findOne({ user: user }) || await EconData.create({ user: user });
        const timeToWork = 60 * 60;

        const mollyUser = await User.findOne({ userId: "911276391901843476" })


        if (!isTimePassed(timeToWork, userEcon.lastWorked)) return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Work cooldown still active")
                    .setDescription("Not enough time has elapsed since the last time you have worked.")
                    .addField("Time remaining", formatTime(Math.ceil(timeToWork - (Math.abs((new Date().getTime() - userEcon.lastWorked.getTime()) / 1000)))), true)
            ]
        });

        const randomAmount = getRandomNumber(1000, 2500);
        const tax = Math.floor(randomAmount * 0.3);
        await user.updateOne({ $inc: { balance: randomAmount } });
        await mollyUser.updateOne({ $inc: { balance: tax } });
        await userEcon.updateOne({ $inc: { timesWorked: 1, totalWorked: randomAmount }, $set: { lastWorked: new Date() } })
        interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#68FC00')
                    .setTitle("Successful work day!")
                    .setDescription(`You made a whopping ${getTieredCoins(randomAmount + tax)} today! Most impressive if I do say so myself. `)
                    .setFields({name :'Gross Pay', value: getTieredCoins(randomAmount + tax), inline: true}, {name: 'Tax', value: getTieredCoins(tax), inline: true},
                    {name: 'Net Pay', value: getTieredCoins(randomAmount), inline: true}, {name: 'New Balance', value: getTieredCoins(user.balance + randomAmount), inline: true})
                    .setFooter({text: `You have worked a total of ${userEcon.timesWorked + 1} times.`})
            ]
        })


    }
}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}

const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const isTimePassed = (seconds, lastWorked) => {
    if (!lastWorked) return true;
    const timePassed = Math.abs((new Date().getTime() - lastWorked.getTime()) / 1000);
    return timePassed > seconds;
}

