const { SlashCommandBuilder, blockQuote, bold, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const FishingData = require('../../models/FishingProfile')
const { User, getTieredCoins } = require('../../models/User')
const { ClientInfo } = require('../../models/ClientInfo');
const { GuildData } = require('../../models/GuildData');
const wait = require('node:timers/promises').setTimeout;
const LootTable = require('loot-table')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription(`The sea is a dangerous place. Use this command to catch a fish.`)
        .addStringOption(option =>
            option.setName('location')
                .setDescription('If you want to choose a specific location, use this option.')
                .setRequired(false)
                .setAutocomplete(true)),
    autocompleteOptions: ['sea', 'river'],
    async execute(interaction) {

        const userId = interaction.user.id;
        const location = interaction.options.getString('location')

        const user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });
        let userFishing = await FishingData.findOne({ user: user }) || await FishingData.create({ user: user });

        if (await !userFishing.rodLevel){
            await userFishing.updateOne({$set: {rodLevel: 0}})
        }

        const baitChance = await userFishing.rodLevel * 0.075 
        const consumedBait = Math.random() > baitChance

        let fishBit = false;
        let failed = false;
        let hooked = false;
        let randomFish;

        const clientInfo = await ClientInfo.findOne({}) || await ClientInfo.create({});
        const timeToFish = clientInfo.fishingCooldown;

        if (userFishing.tierOneBait < 1 && userFishing.tierTwoBait < 1 && userFishing.tierThreeBait < 1 && userFishing.tierFourBait < 1) return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle(`Insufficient Bait`)
                    .setDescription(`You do not have a sufficient amount of bait to fish. You can buy some off the shop.`)
            ]
        })

        if (canFish(timeToFish, userFishing)) {
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
                            (userFishing.tierOneBait != 0) ? { label: "Tier 1 Bait", description: `x${userFishing.tierOneBait}`, value: "one" } : [],
                            (userFishing.tierTwoBait != 0) ? { label: "Tier 2 Bait", description: `x${userFishing.tierTwoBait}`, value: "two" } : [],
                            (userFishing.tierThreeBait != 0) ? { label: "Tier 3 Bait", description: `x${userFishing.tierThreeBait}`, value: "three" } : [],
                            (userFishing.tierFourBait != 0) ? { label: "Tier 4 Bait", description: `x${userFishing.tierFourBait}`, value: "four" } : [],
                            (userFishing.tierFiveBait != 0) ? { label: "Tier 5 Bait", description: `x${userFishing.tierFiveBait}`, value: "five" } : []
                        ])
                )
            await interaction.reply({
                embeds: [embed],
                components: [row],

            })

            const message = await interaction.fetchReply();
            //collector and listener for bait selection
            const filter = i => { return i.user.id === interaction.user.id; }
            const collector = message.createMessageComponentCollector({ filter });
            let baitChoice = null;
            collector.on('collect', async (Interaction) => {
                const choice = (Interaction.values) ? Interaction.values[0] : Interaction.customId
                const type = Interaction.componentType

                const cancelButton = new MessageButton()
                    .setLabel('Cancel')
                    .setStyle('DANGER')
                    .setEmoji("???")
                    .setCustomId('cancel')
                const confirmButton = new MessageButton()
                    .setLabel('Confirm')
                    .setStyle('SUCCESS')
                    .setEmoji("???")
                    .setCustomId('confirm')
                const fishButton = new MessageButton()
                    .setLabel('Hook')
                    .setStyle('SECONDARY')
                    .setEmoji("????")
                    .setCustomId('fish')
                const embed = new MessageEmbed()
                    .setColor('E1E1E1')
                    .setTitle(`${interaction.user.username} has started fishing!`)
                    .setDescription(`Are you sure you would like to use **tier ${choice} bait**?\n` + blockQuote(`Please note that` +
                        ` after clicking confirm, you will be placed into the fishing minigame. There will be a **"Hook Fish"** button` +
                        ` that you must click to catch the fish when it bites. Don't click too early or you'll scare it away.`))
                    .setFooter({ text: "This feature is currently in early access. Bugs are to be expected." })

                const buttonRow = new MessageActionRow().addComponents(cancelButton, confirmButton)

                if (baitChoice == null && type == "SELECT_MENU") baitChoice = choice

                if (type == 'SELECT_MENU') {
                    await Interaction.update({ embeds: [embed], components: [buttonRow] })
                } else if (type == 'BUTTON') {
                    if (choice == 'confirm') {
                        //refresh targetProfile
                        userFishing = await FishingData.findOne({ user: user });
                        if (!canFish(timeToFish, userFishing)) {
                            buttonRow.components.forEach(component => { component.setDisabled(true) })
                            const cooldownProgress = Math.abs((new Date().getTime() - userFishing.lastFished.getTime()) / 1000);
                            return await Interaction.update({
                                embeds: [
                                    embed
                                        .setColor('#FC0000')
                                        .setDescription(`You have an active cooldown. Please try again later.`)
                                        .addField("Time remaining", formatTime(Math.ceil(timeToFish - cooldownProgress)), true)
                                ], components: [buttonRow]
                            })
                        }
                        if (!hasBait(baitChoice, userFishing)) {
                            buttonRow.components.forEach(component => { component.setDisabled(true) })
                            collector.stop();
                            return await Interaction.editReply({
                                embeds: [
                                    embed
                                        .setColor('#FC0000')
                                        .setTitle(`Insufficient Bait`)
                                        .setDescription(`You do not have a sufficient amount of bait to fish. You can buy some off the shop.`)
                                ], components: [buttonRow]
                            })
                        }

                        //user passes all the checks that we currently have in place
                        //start fishing minigame

                        //deduct bait and update targetProfile lastFished

                        randomFish = generateRandomFish(baitChoice, location);

                        if(consumedBait && randomFish) {
                            deductBait(baitChoice, userFishing);
                        }
                        await userFishing.updateOne({ lastFished: Date.now() })

                        if (!randomFish) {
                            failed = true;

                            var date = new Date(Date.now());
                            date.setMinutes(date.getMinutes() - 5);
                            await userFishing.updateOne({ lastFished: date })

                            //set buttonrow to hook button
                            buttonRow.setComponents(fishButton.setDisabled(true))
                            collector.stop();
                            return await Interaction.update({
                                embeds: [
                                    embed
                                        .setColor('#FC0000')
                                        .setTitle(`No Fish`)
                                        .setDescription(`Seems as though there are no fish in this location.`)
                                ], components: [buttonRow]
                            })
                        }

                        buttonRow.setComponents(fishButton)
                        await Interaction.update({
                            embeds: [
                                embed
                                    .setColor(`WHITE`)
                                    .setDescription(blockQuote(`You cast your line and begin fishing. Please wait for a fish to bite.` +
                                        ` When a fish bites, hit the **"Hook"** button to catch it.`))
                            ], components: [buttonRow]
                        })
                        await wait(generateNumberBetween(5000, 10000));
                        if (failed) return;
                        await Interaction.editReply({
                            embeds: [
                                embed
                                    .setColor(`FFFA05`)
                                    .setDescription(blockQuote(`**A fish bit the line!** Quick! Hit the **"Hook"** button to catch it before it gets away!`))
                            ], components: [buttonRow]
                        })
                        fishBit = true;
                        const timeToHook = generateNumberBetween(800, 900) + generateNumberBetween(500, 700) * (1 - randomFish.difficulty / 20);
                        await wait(timeToHook);
                        collector.stop();
                        fishBit = false;
                        buttonRow.components.forEach(component => { component.setDisabled(true) })
                        if (!hooked) {
                            if (failed) return;
                                var date = new Date(Date.now());
                                date.setMinutes(date.getMinutes() - 3);
                                await userFishing.updateOne({ lastFished: date })
                                return await Interaction.editReply({
                                embeds: [
                                    embed
                                        .setColor(`FF0000`)
                                        .setDescription(blockQuote((consumedBait)? ` The fish got away! It has stolen the bait!` :
                                        'The fish got away! Thankfully, you got your bait back!'))
                                ], components: [buttonRow]
                            })
                        }
                    }
                    else if (choice == 'cancel') {
                        buttonRow.components.forEach(component => { component.setDisabled(true) })
                        collector.stop();
                        return await Interaction.update({
                            embeds: [
                                embed
                                    .setColor('#3F3F3F')
                                    .setDescription(`${interaction.user.username} has decided not to fish.`)
                            ],
                            components: [buttonRow]
                        })
                    }
                    else if (choice == 'fish') {
                        buttonRow.setComponents(fishButton)
                        buttonRow.components.forEach(component => { component.setDisabled(true) })
                        collector.stop();
                        if (!fishBit) {
                            failed = true;
                            var date = new Date(Date.now());
                            date.setMinutes(date.getMinutes() - 4);
                            await userFishing.updateOne({ lastFished: date })
                            return await Interaction.update({
                                embeds: [
                                    embed
                                        .setColor(`FF0000`)
                                        .setDescription(blockQuote((consumedBait)? `You scared the fish away. It got away with your bait!` 
                                                    : `You scared the fish away. Thankfully you kept your bait!`))
                                        .addField(`Fish`, bold(randomFish.name), true)
                                ], components: [buttonRow]
                            })
                        } else {
                            hooked = true;

                            if (randomFish.form == 'Loot') {
                                buttonRow.components.forEach(component => { component.setDisabled(true) })
                                if(randomFish.lootType == 'Coin Bag') {
                                    await user.updateOne({ $inc: { balance: randomFish.coins } })
                                    return Interaction.update({
                                        embeds: [
                                            embed
                                            .setColor(rarityInfo.find(obj => obj.rarity === randomFish.rarity).hex)
                                            .setDescription(`${interaction.user.username} has reeled in a **${randomFish.name}**! They quickly` + 
                                            ` put the coins in their bag before Molly Bot sees them and taxes them.`)
                                            .addField(`Bait`, (consumedBait)? `Tier ${baitChoice}` : `Not consumed`, true)
                                            .addField(`Rarity`, rarityInfo.find(obj => obj.rarity === randomFish.rarity).stars, true)
                                            .addField(`Contents`, getTieredCoins(randomFish.coins), true)
                                        ], components: [buttonRow]
                                    })
                                }
                                else if (randomFish.lootType == 'Baitbox') {
                                    await userFishing.updateOne({ $inc: { tierOneBait: randomFish.t1, tierTwoBait: randomFish.t2, tierThreeBait: randomFish.t3,
                                    tierFourBait: randomFish.t4, tierFiveBait: randomFish.t5 } });
                                    return Interaction.update({
                                        embeds: [
                                            embed
                                            .setColor(rarityInfo.find(obj => obj.rarity === randomFish.rarity).hex)
                                            .setDescription(`${interaction.user.username} has reeled in a **${randomFish.name}**! They quickly` + 
                                            ` put the bait into their bag.`)
                                            .addField(`Bait`, (consumedBait)? `Tier ${baitChoice}` : `Not consumed`, true)
                                            .addField(`Rarity`, rarityInfo.find(obj => obj.rarity === randomFish.rarity).stars, true)
                                            .addField(`Contents`, `\`${randomFish.t1}\` Tier 1 Bait\n\`${randomFish.t2}\` Tier 2 Bait\n\`${randomFish.t3}\` Tier 3 Bait\n\`${randomFish.t4}\` Tier 4 Bait\n\`${randomFish.t5}\` Tier 5 Bait`, true)
                                        ], components: [buttonRow]
                                    })

                                }
                            }

                            const shinyRate = clientInfo.shinyRate // no shiny ever
                            let shiny = Math.random() <= shinyRate
                            let vMult = shiny ? 100 : 1

                            const length = randomFish.length - randomFish.l_variance + (Math.floor(Math.random() * randomFish.l_variance * 2 + 1))
                            const weight = (randomFish.weight * (length / randomFish.length)).toFixed(1)
                            const value = Math.floor((weight / randomFish.weight) * randomFish.value * vMult)


                            const characters = "abcdefghijklmnopqrstuvwxyz123456789";
                            let uniqueId = "";
                            const identifierLength = 6;

                            do {

                                uniqueId = "";
                                for (let i = 0; i < identifierLength; i++) {
                                    uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
                                }
                            } while (await FishData.findOne({ fishId: uniqueId }))

                            //if fish doesn't exist in users fishing log, add it
                            const fishingLog = userFishing.fishingLog;
                            if (!fishingLog.find(fish => fish.fishNo == randomFish.fishNo)) {
                                userFishing.fishingLog.push({fishNo: randomFish.fishNo})
                                await userFishing.save();
                            }

                            const newFish = await FishData.create({
                                originalOwner: user.userId,
                                currentOwner: user.userId,
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

                                Interaction.update({
                                    embeds: [
                                        embed
                                            .setColor((!shiny) ? rarityInfo.find(obj => obj.rarity === randomFish.rarity).hex : `#FF0074`)
                                            .setDescription((!shiny) ? `${interaction.user.username} has reeled in a **${randomFish.name}**!` : `${interaction.user.username} has reeled in a *** ???Shiny ${randomFish.name}???***!`)
                                            .addField(`Bait`, (consumedBait)? `Tier ${baitChoice}` : `Not consumed`, true)
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
                                
                                const guildData = await GuildData.findOne({ guildId: interaction.guild.id }) || await GuildData.create({ guildId: interaction.guild.id });
                                const guildBestCatch = await FishData.findById(guildData.bestCatch) || null;
                                const guildBestCatchToday = await FishData.findById(guildData.bestCatchToday) || null;
                                if (guildBestCatch) {
                                    if (value > guildBestCatch.value) {
                                        await guildData.updateOne({ bestCatch: newFish, bestCatchDate: Date.now() })
                                    }
                                }
                                else {
                                    guildData.bestCatch = newFish;
                                    guildData.bestCatchDate = Date.now();
                                    await guildData.save();
                                }

                                var start = new Date();
                                start.setUTCHours(0,0,0,0);
                                if (!guildBestCatchToday) {
                                    await guildData.updateOne({ bestCatchToday: newFish, bestCatchTodayDate: Date.now() })
                                }
                                else {
                                    if(isDateToday(guildData.bestCatchTodayDate)) {
                                        if (value > guildBestCatchToday.value) {
                                            await guildData.updateOne({ bestCatchToday: newFish, bestCatchTodayDate: Date.now() })
                                        }
                                    } else {
                                        await guildData.updateOne({ bestCatchToday: newFish, bestCatchTodayDate: Date.now() })
                                    }
                                }
                        }

                    }
                }


            })

        } else {
            const cooldownProgress = Math.abs((new Date().getTime() - userFishing.lastFished.getTime()) / 1000);
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Fishing cooldown still active")
                        .setDescription(`Not enough time has elapsed since the last time you have gone fishing.`)
                        .addField("Time remaining", formatTime(Math.ceil(timeToFish - cooldownProgress)), true)
                ]
            })
        }

    }

}

//formattime function
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}

//if n seconds have passed since the last time the user has fished, return true
const canFish = (seconds, targetProfile) => {
    if (!targetProfile.lastFished) return true;
    const cooldownProgress = (new Date().getTime() - targetProfile.lastFished.getTime()) / 1000;
    if (cooldownProgress > seconds) return true;
    else return false;
}

//if has bait of type, return true
const hasBait = (type, targetProfile) => {
    switch (type) {
        case "one":
            return targetProfile.tierOneBait > 0;
        case "two":
            return targetProfile.tierTwoBait > 0;
        case "three":
            return targetProfile.tierThreeBait > 0;
        case "four":
            return targetProfile.tierFourBait > 0;
        case "five":
            return targetProfile.tierFiveBait > 0;
        default:
            return false;
    }
}

//deduct bait from user of type
const deductBait = async (type, targetProfile) => {
    switch (type) {
        case "one":
            await targetProfile.updateOne({ $inc: { tierOneBait: -1 } })
            break;
        case "two":
            await targetProfile.updateOne({ $inc: { tierTwoBait: -1 } })
            break;
        case "three":
            await targetProfile.updateOne({ $inc: { tierThreeBait: -1 } })
            break;
        case "four":
            await targetProfile.updateOne({ $inc: { tierFourBait: -1 } })
            break;
        case "five":
            await targetProfile.updateOne({ $inc: { tierFiveBait: -1 } })
        default:
            break;
    }
}

const generateNumberBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const generateRandomFish = (choice, location) => {
    let fish = require("../../data/fishdata")

    const lootTable = new LootTable();
    const totalFish = fish.length;

    const isFourthOfJuly = (new Date().getMonth() == 6 && new Date().getDate() == 4) || (new Date().getMonth() == 6 && new Date().getDate() == 3);
    const isHalloween = (new Date().getMonth() == 10 && new Date().getDate() == 31) || (new Date().getMonth() == 10 && new Date().getDate() == 30);
    const isChristmas = (new Date().getMonth() == 11 && new Date().getDate() == 25) || (new Date().getMonth() == 11 && new Date().getDate() == 24);
    const isNewYears = (new Date().getMonth() == 0 && new Date().getDate() == 1 || new Date().getMonth() ==11 && new Date().getDate() == 31);
    const isEvent = isFourthOfJuly || isHalloween || isChristmas || isNewYears;

    const lootInfo = [
        { rarity: 'Common', tableTotal: 500, amount: fish.filter(x => x.rarity == 'Common').length }, { rarity: 'Uncommon', tableTotal: 300, amount: fish.filter(x => x.rarity == 'Uncommon').length },
        { rarity: 'Rare', tableTotal: 150, amount: fish.filter(x => x.rarity == 'Rare').length }, { rarity: 'Epic', tableTotal: 80, amount: fish.filter(x => x.rarity == 'Epic').length },
        { rarity: 'Legendary', tableTotal: 25, amount: fish.filter(x => x.rarity == 'Legendary').length }, { rarity: 'Mythical', tableTotal: 2, amount: fish.filter(x => x.rarity == 'Mythical').length },
        { rarity: 'Event', tableTotal: (isEvent)? 50 : 0, amount: fish.filter(x => x.rarity == 'Event').length },
    ]

    switch (choice) {
        case "five":
            fish = fish.filter((x) => { return (x.rarity != 'Epic') })
        case "four":
            fish = fish.filter((x) => { return (x.rarity != 'Rare') })
        case "three":
            fish = fish.filter((x) => { return x.rarity != 'Uncommon' })
        case "two":
            fish = fish.filter((x) => { return x.rarity != 'Common' })
    }

    switch (location){
        case "sea":
            fish = fish.filter((x) => { return x.type == 'Saltwater' })
        case "river":
            fish = fish.filter((x) => { return x.type == 'Freshwater' })
    }

    if (isFourthOfJuly){
        fish = fish.filter((x) => { return x.event == 'Fourth of July' || !x.event})
    }
    else if(isHalloween){
        fish = fish.filter((x) => { return x.event == 'Halloween' || !x.event})
    }
    else if(isChristmas){
        fish = fish.filter((x) => { return x.event == 'Christmas' || !x.event})
    }
    else if(isNewYears){
        fish = fish.filter((x) => { return x.event == 'New Years' })
    }


    const dayMap = new Map()
    dayMap.set("Morning", [5, 11])
    dayMap.set("Afternoon", [12, 17])
    dayMap.set("Evening", [18, 21])

    var date = new Date(Date.now());
    date.setHours(date.getHours() - 4)
    const now = date.getHours()

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

    for (let i = 0; i < fish.length; i++) {
        for (let k = 0; k < lootInfo.length; k++) {
            if (fish[i].rarity == lootInfo[k].rarity) {
                lootTable.add(fish[i], Math.floor(lootInfo[k].tableTotal / lootInfo[k].amount))
            }
        }
    }

    return lootTable.choose();
}

function isDateToday(date) {
    const otherDate = new Date(date);
    const todayDate = new Date();
  
    if (
      otherDate.getDate() === todayDate.getDate() &&
      otherDate.getMonth() === todayDate.getMonth() &&
      otherDate.getYear() === todayDate.getYear()
    ) {
      return true;
    } else {
      return false;
    }
  }