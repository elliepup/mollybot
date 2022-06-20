const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const FishingData = require('../../models/FishingProfile')
const { getTieredCoins } = require('../../models/EconProfile')
const { FishData, rarityInfo } = require('../../models/Fish')
const LootTable = require('loot-table');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription("It's time to go fishing."),
    async execute(interaction) {

        const userId = interaction.user.id;
        const targetProfile = await FishingData.findOne({ userId: userId }) || await FishingData.create({ userId: userId });
        const timeToFish = 3;
        const cooldownProgress = (targetProfile.lastFished) ? Math.abs((new Date().getTime() - targetProfile.lastFished.getTime()) / 1000) : timeToFish + 1;

        if (cooldownProgress > timeToFish) {
            if (targetProfile.isFishing) return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Already fishing")
                        .setDescription("You are already fishing! Please try again after you have finished fishing.")
                ]
            })

            await targetProfile.updateOne({ isFishing: true })

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
                        await targetProfile.updateOne({ isFishing: false })
                        return interaction.editReply({
                            embeds: [
                                embed
                                    .setColor('#3F3F3F')
                                    .setDescription(`${interaction.user.username} has decided not to fish.`)
                            ],
                            components: [buttonRow]
                        })

                    }
                    await targetProfile.updateOne({ lastFished: Date.now(), isFishing: false })
                    let fish = require("../../data/fishdata")


                    const lootTable = new LootTable();

                    const totalFish = fish.length;

                    const lootInfo = [{ rarity: "Common", percentage: fish.filter(x => x.rarity == 'Common').length / totalFish, multiplier: 6000 },
                    { rarity: "Uncommon", percentage: fish.filter(x => x.rarity == 'Uncommon').length / totalFish, multiplier: 4500 }, { rarity: "Rare", percentage: fish.filter(x => x.rarity == 'Rare').length / totalFish, multiplier: 3000 },
                    { rarity: "Epic", percentage: fish.filter(x => x.rarity == 'Epic').length / totalFish, multiplier: 1000 }, { rarity: "Legendary", percentage: fish.filter(x => x.rarity == 'Legendary').length / totalFish, multiplier: 250 },
                    { rarity: "Mythical", percentage: fish.filter(x => x.rarity == 'Mythical').length / totalFish, multiplier: 20 }
                    ]

                    switch (choice) {
                        case "four":
                            fish = fish.filter((obj) => {return obj.rarity != 'Rare'})
                        case "three":
                        fish = fish.filter((obj) => {return obj.rarity !='Uncommon'})
                        case "two": 
                        fish = fish.filter((obj) => {return obj.rarity != 'Common'})   
                    }

                    for (let i = 0; i < fish.length; i++) {
                        for (let k = 0; k < lootInfo.length; k++) {
                            if (fish[i].rarity == lootInfo[k].rarity)
                                lootTable.add(fish[i], Math.ceil(lootInfo[k].percentage * lootInfo[k].multiplier))
                        }
                    }

                    const randomFish = lootTable.choose();

                    const length = randomFish.length - randomFish.l_variance + (Math.floor(Math.random() * randomFish.l_variance * 2 + 1))
                    const weight = (randomFish.weight * (length / randomFish.length)).toFixed(1)
                    const value = Math.floor((weight / randomFish.weight) * randomFish.value)

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
                        rarity: randomFish.rarity,
                        type: randomFish.name,
                        length: length,
                        weight: weight,
                        value: value,
                        color: randomFish.color
                    })
                    interaction.editReply({
                        embeds: [
                            embed
                                .setColor(rarityInfo.find(obj => obj.rarity === randomFish.rarity).hex)
                                .setDescription(`${interaction.user.username} has reeled in a **${randomFish.name}**!`)
                                .addField(`Rarity`, rarityInfo.find(obj => obj.rarity === randomFish.rarity).stars, true)
                                .addField(`Length`, (length > 24) ? `*${(length / 12).toFixed(1)} ft*` : `*${length} in*`, true)
                                .addField(`Weight`, (weight > 4000) ? `*${(weight / 2000).toFixed(1)} tons*` : `*${weight.toString()} lb*`, true)
                                .addField(`Color`, randomFish.color, true)
                                .addField(`Selling Price`, getTieredCoins(value), true)
                                .addField(`Identifier`, `\`${uniqueId}\``, true)
                        ],
                        components: [buttonRow]
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

const generateId = () => {

}