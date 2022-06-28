const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData } = require('../../models/EconProfile');
const FishingData = require('../../models/FishingProfile');
const { User, getTieredCoins } = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldowns')
        .setDescription('Displays the remaining time for cooldowns.'),
    async execute(interaction) {

        const userId = interaction.user.id;
        const targetEcon = await EconData.findOne({userId: userId}) || await EconData.create({userId: userId});
        const timeToWork = 60 * 60;
        const workCDProgress = (targetEcon.workCooldown) ? Math.abs((new Date().getTime() - targetEcon.workCooldown.getTime()) / 1000) : timeToWork + 1;
        const targetProfile = await FishingData.findOne({ userId: userId }) || await FishingData.create({ userId: userId });
        const timeToFish = 60 * 5;
        const fishCDProgress = (targetProfile.lastFished) ? Math.abs((new Date().getTime() - targetProfile.lastFished.getTime()) / 1000) : timeToFish + 1;

        
        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FFFFFF')
                .setTitle(`${interaction.user.username}'s Cooldowns`)
                .addField("Work Cooldown", (workCDProgress > timeToWork) ? "✅ You are now able to work!" :`❌ ${(formatTime(Math.ceil(timeToWork - workCDProgress)))}`, true)
                .addField("Fishing Cooldown", (fishCDProgress > timeToFish) ? "✅ You are now able to fish!" : `❌ ${(formatTime(Math.ceil(timeToFish - fishCDProgress)))}`)
            ]
        })
    }

}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}