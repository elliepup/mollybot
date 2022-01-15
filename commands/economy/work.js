const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const { getTieredCoins, getBalance, updateBalance, updateEconAttribute, getEconProfile } = require('../../extras/econFunctions')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for coins!'),
    async execute(interaction) {

        const userId = interaction.user.id;
        const econData = await getEconProfile(userId);
        const timeToWork = 60 * 60;
        const userCooldown = econData.workCooldown;
        const cooldownProgress = (userCooldown == 0) ? timeToWork + 1 : Math.abs((new Date().getTime() - userCooldown) / 1000);

        
        if (cooldownProgress > timeToWork) {
            const randomAmount = 1500 + Math.floor(Math.random() * 500 + 1);
            await updateBalance(userId, randomAmount);
            await updateEconAttribute(userId, "coinsFromWorking", randomAmount)
            await updateEconAttribute(userId, "timesWorked", 1)
            await updateEconAttribute(userId, "workCooldown", Date.now())

            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#68FC00')
                        .setTitle("Successful work day!")
                        .setDescription(`You made a whopping ${getTieredCoins(randomAmount)} today! Most impressive if I do say so myself.`)
                        .addField('New balance', getTieredCoins(await getBalance(interaction.user.id)))
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