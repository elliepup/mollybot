const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { EconData, getTieredCoins } = require('../../models/EconProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for coins!'),
    async execute(interaction) {

        const userId = interaction.user.id;
        const targetEcon = await EconData.findOne({userId: userId}) || await EconData.create({userId: userId});
        const timeToWork = 60 * 60;

        const userCooldown = targetEcon.workCooldown;
        const cooldownProgress = (targetEcon.workCooldown) ? Math.abs((new Date().getTime() - targetEcon.workCooldown.getTime()) / 1000) : timeToWork + 1;

        if(cooldownProgress > timeToWork) {
            const randomAmount = 1000 + Math.floor(Math.random() * 1000 + 1)
            await targetEcon.updateOne( {$inc: {balance: randomAmount, timesWorked: 1, totalWorked: randomAmount}} )
            await targetEcon.updateOne( {workCooldown: Date.now()} )
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#68FC00')
                    .setTitle("Successful work day!")
                    .setDescription(`You made a whopping ${getTieredCoins(randomAmount)} today! Most impressive if I do say so myself.`)
                    .addField('New balance', getTieredCoins(targetEcon.balance + randomAmount))
                ]
            })
        } else {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Work cooldown still active")
                    .setDescription("Not enough time has elapsed since the last time you have worked.")
                    .addField("Time remaining", formatTime(Math.ceil(timeToWork - cooldownProgress)), true)
                ]
            })
        }
        
    }
}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}
