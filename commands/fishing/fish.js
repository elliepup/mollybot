const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const FishingData = require('../../models/FishingProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription("It's time to go fishing."),
    async execute(interaction) {
        const fish = require("../../data/fishdata")

        const userId = interaction.user.id;
        const targetProfile = await FishingData.findOne({ userId: userId }) || await FishingData.create({ userId: userId });
        const timeToFish = 3;
        const cooldownProgress = (targetProfile.lastFished) ? Math.abs((new Date().getTime() - targetProfile.lastFished.getTime()) / 1000) : timeToFish + 1;

        if (cooldownProgress > timeToFish) {
            await targetProfile.updateOne({ lastFished: Date.now() })

            const embed = new MessageEmbed()
                .setColor('E1E1E1')
                .setTitle(`${interaction.user.username} has started fishing!`)
                .setDescription("Please select the type of bait that you would like to use.")
                .setFooter({ text: "This feature is currently is early access." })

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('No bait selected')
                        .addOptions([
                            (targetProfile.tierOneBait != 0) ? { label: "Tier 1 Bait", description: `x${targetProfile.tierOneBait}`, value: "t1" } : [],
                            (targetProfile.tierTwoBait != 0) ? { label: "Tier 2 Bait", description: `x${targetProfile.tierTwoBait}`, value: "t2" } : [],
                            (targetProfile.tierThreeBait != 0) ? { label: "Tier 3 Bait", description: `x${targetProfile.tierThreeBait}`, value: "t3" } : [],
                            (targetProfile.tierFourBait != 0) ? { label: "Tier 4 Bait", description: `x${targetProfile.tierFourBait}`, value: "t4" } : []

                        ])
                )
            interaction.reply({
                embeds: [embed],
                components: [row],

            })

            //fetching the message of the interaction reply to create an interaction collector on that specific message
            const message = await interaction.fetchReply();

            //user specific filter; only the person who initiated the interaction can react
            const filter = i => {
                i.deferUpdate();
                return i.user.id === interaction.user.id;
            }

            //collector on message with filter and a maximum of one interaction
            const collector = message.createMessageComponentCollector({
                filter,
                max: 1,
            })

            collector.on('end', async (SelectMenuInteraction) => {
                const choice = SelectMenuInteraction.first().values[0]
                /*TODO 
                add button to confirm the usage of bait
                prevent infinite fishing glitch
                create fish algorithm
                create fish object and populate database
                */
            })

        } else {
            interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Fishing cooldown still active")
                        .setDescription("Not enough time has elapsed since the last time you have gone fishing.")
                        .addField("Time remaining", formatTime(Math.ceil(timeToFish - cooldownProgress)), true)
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