const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const FishingData = require('../../models/FishingProfile')
const { getTieredCoins } = require('../../models/EconProfile')
const { FishData, rarityInfo } = require('../../models/Fish')
const LootTable = require('loot-table');
const { spawn } = require('child_process')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription("It's time to go fishing."),
    async execute(interaction) {

        const userId = interaction.user.id;
        let targetProfile = await FishingData.findOne({ userId: userId }) || await FishingData.create({ userId: userId });
        const timeToFish = 60 * 5;
        let cooldownProgress = (targetProfile.lastFished) ? Math.abs((new Date().getTime() - targetProfile.lastFished.getTime()) / 1000) : timeToFish + 1;

        if (targetProfile.tierOneBait < 1 && targetProfile.tierTwoBait < 1 && targetProfile.tierThreeBait < 1 && targetProfile.tierFourBait < 1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle(`Insufficient Bait`)
                    .setDescription(`You do not have a sufficient amount of bait to fish. You can buy some off the shop.`)
            ]
        })
        if (cooldownProgress > timeToFish) {

            const embed = new MessageEmbed()
                .setColor('E1E1E1')
                .setTitle(`${interaction.user.username} has started fishing!`)
                .setDescription("Please select the type of bait that you would like to use.")
                .setFooter({ text: "This feature is currently in early access. Bugs are to be expected." })

            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('No bait selected')
                        .addOptions([
                            (targetProfile.tierOneBait != 0) ? { label: "Tier 1 Bait", description: `x${targetProfile.tierOneBait}`, value: "one" } : [],
                            (targetProfile.tierTwoBait != 0) ? { label: "Tier 2 Bait", description: `x${targetProfile.tierTwoBait}`, value: "two" } : [],
                            (targetProfile.tierThreeBait != 0) ? { label: "Tier 3 Bait", description: `x${targetProfile.tierThreeBait}`, value: "three" } : [],
                            (targetProfile.tierFourBait != 0) ? { label: "Tier 4 Bait", description: `x${targetProfile.tierFourBait}`, value: "four" } : []
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
                const buttonRow = new MessageActionRow().addComponents([
                    new MessageButton()
                        .setLabel("Cancel")
                        .setEmoji("✖")
                        .setStyle("DANGER")
                        .setCustomId("cancel"),
                    new MessageButton()
                        .setLabel("Confirm")
                        .setEmoji("✔")
                        .setStyle("SUCCESS")
                        .setCustomId("confirm")
                ])

                interaction.editReply({
                    embeds: [
                        embed
                            .setDescription(`Are you sure you would like to use **tier ${choice} bait**?`)
                    ],
                    components: [buttonRow]
                })

                const edit = await interaction.fetchReply();

                const buttonCollector = edit.createMessageComponentCollector({
                    filter,
                    max: 1,
                })

                buttonCollector.on('end', async (ButtonInteraction) => {
                    const buttonId = ButtonInteraction.first().customId;
                    (buttonRow.components).forEach(element => { element.setDisabled(true) });
                    if (buttonId == 'cancel') {
                        return interaction.editReply({
                            embeds: [
                                embed
                                    .setColor('#3F3F3F')
                                    .setDescription(`${interaction.user.username} has decided not to fish.`)
                            ],
                            components: [buttonRow]
                        })

                    }

                    targetProfile = await FishingData.findOne({ userId: interaction.user.id })
                    cooldownProgress = (targetProfile.lastFished) ? Math.abs((new Date().getTime() - targetProfile.lastFished.getTime()) / 1000) : timeToFish + 1;

                    if (cooldownProgress < timeToFish) return interaction.editReply({
                        embeds: [
                            embed
                                .setColor('#FC0000')
                                .setDescription(`You have an active cooldown. Please try again later.`)
                                .addField("Time remaining", formatTime(Math.ceil(timeToFish - cooldownProgress)), true)
                        ], components: [buttonRow]
                    })

                    //refreshes profile
                    targetProfile = await FishingData.findOne({ userId: userId })

                    let randomFish = generateRandomFish(choice, targetProfile)

                    if (!randomFish) {
                        return interaction.editReply({
                            embeds: [
                                embed
                                    .setColor('#FC0000')
                                    .setDescription(`You do not have a sufficient amount of bait to fish. You can buy some off the shop.`)
                            ], components: [buttonRow]
                        })
                    }

                    await targetProfile.updateOne({ lastFished: Date.now() })
                    const shinyRate = 0.00025 // no shiny ever
                    let shiny = Math.random() <= shinyRate
                    let vMult = shiny ? 100 : 1

                    const length = randomFish.length - randomFish.l_variance + (Math.floor(Math.random() * randomFish.l_variance * 2 + 1))
                    const weight = (randomFish.weight * (length / randomFish.length)).toFixed(1)
                    const value = Math.floor((weight / randomFish.weight) * randomFish.value * vMult)

                    //generate random identifier for fish
                    const characters = "abcdefghijklmnopqrstuvwxyz123456789";
                    let uniqueId = "";
                    const identifierLength = 6;

                    do {

                        uniqueId = "";
                        for (let i = 0; i < identifierLength; i++) {
                            uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                    } while (await FishData.findOne({ fishId: uniqueId }))

                    await FishData.create({
                        originalOwner: interaction.user.id,
                        currentOwner: interaction.user.id,
                        catchDate: Date.now(),
                        fishId: uniqueId,
                        fishNo: randomFish.fishNo,
                        rarity: randomFish.rarity,
                        type: randomFish.name,
                        length: length,
                        weight: weight,
                        value: value,
                        color: randomFish.color,
                        shiny: shiny
                    })

                    interaction.editReply({
                        embeds: [
                            embed
                                .setColor((!shiny) ? rarityInfo.find(obj => obj.rarity === randomFish.rarity).hex : `#FF0074`)
                                .setDescription((!shiny) ? `${interaction.user.username} has reeled in a **${randomFish.name}**!` : `${interaction.user.username} has reeled in a *** ⭐Shiny ${randomFish.name}⭐***!`)
                                .addField(`Rarity`, rarityInfo.find(obj => obj.rarity === randomFish.rarity).stars, true)
                                .addField(`Length`, (length > 24) ? `*${(length / 12).toFixed(1)} ft*` : `*${length} in*`, true)
                                .addField(`Weight`, (weight > 4000) ? `*${(weight / 2000).toFixed(1)} tons*` : `*${weight.toString()} lb*`, true)
                                .addField(`Color`, randomFish.color, true)
                                .addField(`Selling Price`, getTieredCoins(value), true)
                                .addField(`Identifier`, `\`${uniqueId}\``, true)

                                .setThumbnail((!shiny) ? `attachment://${randomFish.fishNo}.png` : `attachment://${randomFish.fishNo}.png`)
                        ],
                        components: [buttonRow], files: [(!shiny) ? `./extras/${randomFish.fishNo}.png` : `./extras/shiny/${randomFish.fishNo}.png`]
                    })
                })

                /*TODO 
                create fish algorithm
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

const generateRandomFish = (choice, targetProfile) => {
    let fish = require("../../data/fishdata")


    const lootTable = new LootTable();
    const totalFish = fish.length;

    const lootInfo = [
        { rarity: 'Common', tableTotal: 500, amount: fish.filter(x => x.rarity == 'Common').length }, { rarity: 'Uncommon', tableTotal: 300, amount: fish.filter(x => x.rarity == 'Uncommon').length },
        { rarity: 'Rare', tableTotal: 150, amount: fish.filter(x => x.rarity == 'Rare').length }, { rarity: 'Epic', tableTotal: 80, amount: fish.filter(x => x.rarity == 'Epic').length },
        { rarity: 'Legendary', tableTotal: 25, amount: fish.filter(x => x.rarity == 'Legendary').length }, { rarity: 'Mythical', tableTotal: 2, amount: fish.filter(x => x.rarity == 'Mythical').length }

    ]


    switch (choice) {
        case "four":
            fish = fish.filter((x) => { return (x.rarity != 'Rare' && x.rarity != 'Uncommon' && x.rarity != 'Common') })
            if (targetProfile.tierFourBait < 1) return null
            targetProfile.updateOne({ $inc: { tierFourBait: -1 } })
                .then(() => { })
            break;
        case "three":
            fish = fish.filter((x) => { return x.rarity != 'Uncommon' && x.rarity != 'Common' })
            if (targetProfile.tierThreeBait < 1) return null
            targetProfile.updateOne({ $inc: { tierThreeBait: -1 } })
                .then(() => { })
            break;
        case "two":
            fish = fish.filter((x) => { return x.rarity != 'Common' })
            if (targetProfile.tierTwoBait < 1) return null
            targetProfile.updateOne({ $inc: { tierTwoBait: -1 } })
                .then(() => { })
            break;
        case "one":
            if (targetProfile.tierOneBait < 1) return null
            targetProfile.updateOne({ $inc: { tierOneBait: -1 } })
                .then(() => { })
    }

    const dayMap = new Map()
    dayMap.set("Morning", [5, 11])
    dayMap.set("Afternoon", [12, 17])
    dayMap.set("Evening", [18, 21])

    const now = new Date().getHours()

    if (now >= dayMap.get("Morning")[0] && now <= dayMap.get("Morning")[1]) {
        fish = fish.filter((x) => { return x.time == "Morning" || x.time == "All" })
    }
    else if ((now >= dayMap.get("Afternoon")[0] && now <= dayMap.get("Afternoon")[1])) {
        fish = fish.filter((x) => { return x.time == "Afternoon" || x.time == "All" })
    }
    else if (now >= dayMap.get("Evening")[0] && now <= dayMap.get("Evening")[1]) {
        fish = fish.filter((x) => { return x.time == "Evening" || x.time == "All" })
    }
    else {
        fish = fish.filter((x) => { return x.time == "Night" || x.time == "All" })
    }

    const shinyRate = 0.10

    if (Math.random() <= shinyRate) {

    }

    for (let i = 0; i < fish.length; i++) {
        for (let k = 0; k < lootInfo.length; k++) {
            if (fish[i].rarity == lootInfo[k].rarity) {
                lootTable.add(fish[i], Math.floor(lootInfo[k].tableTotal / lootInfo[k].amount))
            }
        }
    }

    return lootTable.choose();
}