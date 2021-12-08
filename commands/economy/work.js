const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const Users = require('../../models/Users')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for coins!'),
    async execute(interaction) {

        const timeToWork = 60 * 30;
        const userData = await Users.findOne({ userId: interaction.user.id }) || await Users.create({ userId: interaction.user.id });
        const cooldownProgress = (userData.workCooldown) ? Math.abs((new Date().getTime() - userData.workCooldown.getTime()) / 1000) : timeToWork + 1;

        //if enough time has elapsed to be off cooldown
        if (cooldownProgress > timeToWork) {
            const randomAmount = Math.floor(Math.random() * 10000 + 1);
            await userData.updateOne({ $inc: { balance: randomAmount }, $set: { workCooldown: new Date() } });
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#68FC00')
                    .setTitle("Successful work day!")
                    .setDescription(`You made a whopping ${getTieredCoins(randomAmount)} today! Most impressive if I do say so myself. You may work again in half an hour.`)
                    .addField('New balance', getTieredCoins(userData.balance + randomAmount))
                ]
            })
        }

        //if not enough time has elapsed
        else {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Work cooldown still active")
                        .setDescription("Not enough time has elapsed since the last time you have worked.")
                        .addField("Time remaining", formatTime(Math.ceil(timeToWork - cooldownProgress)), true)
                ],
            },
            )
        }
    }

}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}


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