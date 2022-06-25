const { SlashCommandBuilder, blockQuote, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow, MessageCollector } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile')
const FishingData = require('../../models/FishingProfile')
const TradeData = require('../../models/TradeRecord')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Allows you to trade with another member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person you wish to trade with')
                .setRequired(true)),
    async execute(interaction) {
        const trader = interaction.user;
        const partner = interaction.options.getUser("target");

        const tradeTimeout = 600000
        let successOrCancelled = false;

        if (trader == partner) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Unable to trade")
                    .setDescription("You are not able to trade to yourself!")
            ]
        })

        if (partner.bot) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Unable to trade")
                    .setDescription("You are not able to trade to a bot!")
            ]
        })

        const embed = new MessageEmbed()
            .setColor('E1E1E1')
            .setTitle(`Active Trade`)
            .setDescription(`Please enter the items you would like to trade. For fish, enter the identifier. The trade request will`
                + ` be cancelled automatically after **10 minutes**.\n${blockQuote(`**[${trader.username}]:** `)} ❌\n**[${partner.username}]:** ❌`)
            .addFields({ name: trader.username, value: `\`\`\`...\`\`\`` },
                { name: partner.username, value: `\`\`\`...\`\`\`` })
            .setFooter({ text: `This trade will be cancelled at ${new Date(Date.now() + (tradeTimeout)).toLocaleTimeString()} if both parties do not confirm.` })

        const cancelButton = new MessageButton()
            .setLabel("Cancel")
            .setEmoji("✖")
            .setStyle("DANGER")
            .setCustomId("cancel")
        const confirmButton = new MessageButton()
            .setLabel("Confirm")
            .setEmoji("✔")
            .setStyle("SUCCESS")
            .setCustomId("confirm")
        let row = new MessageActionRow().addComponents(cancelButton, confirmButton)

        interaction.reply({
            embeds: [embed],
            components: [row]
        })

        const filter = m => ((m.content.length == 6 || m.content.includes('coins'))
            && (m.author.id == trader.id || m.author.id == partner.id));

        const collector = interaction.channel.createMessageCollector({ filter, time: tradeTimeout });
        const traderFishOffering = [];
        const partnerFishOffering = [];
        let traderConfirmed, traderFinalized, partnerConfirmed, partnerFinalized = false;

        const availableFish = await FishData.find({ $or: [{ currentOwner: trader.id }, { currentOwner: partner.id }] })


        collector.on('collect', m => {

            const refreshTradingBoard = () => {
                traderConfirmed = false;
                partnerConfirmed = false;
                interaction.editReply({
                    embeds: [
                        embed
                            .setFields(
                                { name: trader.username, value: (traderFishOffering.length ? codeBlock(traderFishOffering.map(x => `[${x.fishId}] · ${rarityInfo.find(k => k.rarity == x.rarity).stars} · ${x.type} · ${x.value} coins`).join('\n')) : codeBlock('...')) },
                                { name: partner.username, value: (partnerFishOffering.length ? codeBlock(partnerFishOffering.map(x => `[${x.fishId}] · ${rarityInfo.find(k => k.rarity == x.rarity).stars} · ${x.type} · ${x.value} coins`).join('\n')) : codeBlock('...')) }
                            )
                            .setDescription(`Please enter the items you would like to trade. For fish, enter the identifier. The trade request will`
                                + ` be cancelled automatically after **10 minutes**.\n${blockQuote(`**[${trader.username}]:** `)} ❌\n**[${partner.username}]:** ❌`)
                    ]
                })
            }

            const content = m.content;
            const fish = availableFish.find(x => x.fishId == content)
            if (fish) {
                if (!(traderFishOffering.find(x => x.fishId == fish.fishId) || partnerFishOffering.find(x => x.fishId == fish.fishId))) {
                    if (fish.currentOwner == trader.id && fish.currentOwner == m.author.id && traderFishOffering.length < 5) {
                        traderFishOffering.push(fish);
                        refreshTradingBoard();
                    }
                    else if (fish.currentOwner == partner.id && fish.currentOwner == m.author.id && partnerFishOffering.length < 5) {
                        partnerFishOffering.push(fish);
                        refreshTradingBoard();
                    }
                }



            }
        });

        collector.on('end', collected => {
            if (successOrCancelled) return;
            row.components.forEach(element => { element.setDisabled(true) });
            return interaction.editReply({
                embeds: [
                    embed
                        .setColor('#3F3F3F')
                        .setTitle("Inactive Trade")
                        .setDescription(`The trade has timed out. If you wish to trade again, use /trade to open another.`)
                ], components: [row]
            })
        });

        //stuffs
        const message = await interaction.fetchReply();

        const buttonFilter = i => {
            i.deferUpdate();
            return i.user.id === trader.id || partner.id;
        }

        const buttonCollector = message.createMessageComponentCollector({
            buttonFilter,
        })

        buttonCollector.on('collect', async (ButtonInteraction) => {

            const buttonId = (ButtonInteraction.customId)


            if (buttonId == 'cancel') {
                successOrCancelled = true
                collector.stop();
                row.components.forEach(element => { element.setDisabled(true) });
                return ButtonInteraction.update({
                    embeds: [
                        embed
                            .setTitle(`Inactive Trade`)
                            .setDescription(`The request has been cancelled by ${ButtonInteraction.user.username}. If you wish to trade again, send another request.`)
                            .setColor('#3F3F3F')
                    ],
                    components: [row]
                })
            }

            if (buttonId == 'confirm') {
                if (!(traderFishOffering.length || partnerFishOffering.length)) {
                    ButtonInteraction.update({
                        embeds: [
                            embed
                        ]
                    })
                }
                else {
                    if (ButtonInteraction.user == trader) traderConfirmed = true
                    else if (ButtonInteraction.user == partner) partnerConfirmed = true

                    await ButtonInteraction.update({
                        embeds: [
                            embed
                                .setDescription(`Please enter the items you would like to trade. For fish, enter the identifier. The trade request will`
                                    + ` be cancelled automatically after **10 minutes**.\n${blockQuote(`**[${trader.username}]:** `)}` + `${traderConfirmed ? '✅' : '❌'}\n**[${partner.username}]:** ${partnerConfirmed ? '✅' : '❌'}`)
                        ]
                    })
                }

            }

            if (buttonId == 'finalize') {
                if (ButtonInteraction.user == trader) traderFinalized = true
                else if (ButtonInteraction.user == partner) partnerFinalized = true
                await ButtonInteraction.update({
                    embeds: [
                        embed
                            .setDescription("Please take a moment to verify that you would like to accept this trade. I will **NOT** restore scammed items." +
                                `\n${blockQuote(`**[${trader.username}]:** `)}` + `${traderFinalized ? '✅' : '❌'}\n**[${partner.username}]:** ${partnerFinalized ? '✅' : '❌'}`)
                    ]
                })
            }
            if ((traderConfirmed && partnerConfirmed)) {
                successOrCancelled = true;
                collector.stop();
                traderConfirmed, partnerConfirmed = false
                const finalizeButton = new MessageButton()
                    .setLabel("Finalize")
                    .setEmoji("🔒")
                    .setStyle("PRIMARY")
                    .setCustomId("finalize")

                row = new MessageActionRow().setComponents(cancelButton, finalizeButton)

                ButtonInteraction.editReply({
                    embeds: [
                        embed
                            .setDescription("Please take a moment to verify that you would like to accept this trade. I will **NOT** restore scammed items." +
                                `\n${blockQuote(`**[${trader.username}]:** `)} ❌\n**[${partner.username}]:** ❌`)
                    ],
                    components: [row]
                })
            }

            if ((traderFinalized && partnerFinalized)) {
                successOrCancelled = true;
                buttonCollector.stop()
                //put logic for successful trade

                row.components.forEach(element => { element.setDisabled(true) });
                finalizeTrade(trader.id, partner.id, traderFishOffering, partnerFishOffering, ButtonInteraction, embed, row)
            }

        })


    }
}


const finalizeTrade = async (traderId, partnerId, traderFishOffering, partnerFishOffering, interaction, embed, row) => {

    //this may look goofy and it probably is but its to prevent people from like reverse scamming i honestly dont even know what you'd call it
    const traderFish = await FishData.find({ currentOwner: traderId })
    const partnerFish = await FishData.find({ currentOwner: partnerId })


    //double checks to make sure all fish actually belong to the trader
    for (let i = 0; i < traderFishOffering.length; i++) {
        if (!traderFish.find(x => x.fishId == traderFishOffering[i].fishId)) return interaction.editReply({
            embeds: [
                embed
                    .setColor("D2D2D2")
                    .setTitle("Inactive Trade")
                    .setDescription(`The trade has been cancelled due to an item no longer existing or belonging to one of the traders.`)
            ]
        })
    }

    //same thing but for the trading partner
    for (let i = 0; i < partnerFishOffering.length; i++) {
        if (!partnerFish.find(x => x.fishId == partnerFishOffering[i].fishId)) return interaction.editReply({
            embeds: [
                embed
                    .setColor("D2D2D2")
                    .setTitle("Inactive Trade")
                    .setDescription(`The trade has been cancelled due to an item no longer existing or belonging to one of the traders.`)
            ]
        })
    }

    //generates trade receipt
    const characters = "abcdefghijklmnopqrstuvwxyz123456789";
    let uniqueId = "";
    const identifierLength = 6;

    do {

        uniqueId = "";
        for (let i = 0; i < identifierLength; i++) {
            uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    } while (await TradeData.findOne({ tradeId: uniqueId }))

    await TradeData.create( {traderId: traderId, partnerId: partnerId, tradeId: uniqueId, traderFishOffering: traderFishOffering, partnerFishOffering: partnerFishOffering,
    traderCoins: 0, partnerCoins: 0, timeCompleted: Date.now()} )


    //transfers ownership of the fish
    const allFish = traderFishOffering.concat(partnerFishOffering)
    for (i = 0; i < allFish.length; i++) {
        await FishData.findOneAndUpdate({ fishId: allFish[i].fishId }, { currentOwner: (allFish[i].currentOwner == traderId) ? partnerId : traderId })
    }

    interaction.editReply({
        embeds: [
            embed
                .setTitle("Inactive Trade")
                .setColor('4ADC00')
                .setDescription(`The trade has been completed successfully! Please take note of the trade receipt for future use.\n**Trade receipt:** \`${uniqueId}\``)
        ],
        components: [row]
    })
}
