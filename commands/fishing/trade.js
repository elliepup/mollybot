const { SlashCommandBuilder, blockQuote, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow, MessageCollector } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile')
const FishingData = require('../../models/FishingProfile')

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
                + ` be cancelled automatically after **5 minutes**.\n${blockQuote(`**[${trader.username}]:** `)} ❌\n**[${partner.username}]:** ❌`)
            .addFields({ name: trader.username, value: `\`\`\`...\`\`\`` },
                { name: partner.username, value: `\`\`\`...\`\`\`` })
            .setFooter({ text: "This command is currently very experimental. Bugs are expected." })

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

        const collector = interaction.channel.createMessageCollector({ filter, time: 300000 });
        const traderFishOffering = [];
        const partnerFishOffering = [];
        let traderConfirmed = false;
        let partnerConfirmed = false;
        const availableFish = await FishData.find({ $or: [{ currentOwner: trader.id }, { currentOwner: partner.id }] })


        collector.on('collect', m => {

            const refreshTradingBoard = () => {
                traderConfirmed = false;
                partnerConfirmed = false;
                interaction.editReply({
                    embeds: [
                        embed
                            .setFields(
                                { name: trader.username, value: (traderFishOffering.length ? codeBlock(traderFishOffering.map(x => `[${x.fishId}] · ${x.type} · ${x.value} coins`).join('\n')) : codeBlock('...')) },
                                { name: partner.username, value: (partnerFishOffering.length ? codeBlock(partnerFishOffering.map(x => `[${x.fishId}] · ${x.type} · ${x.value} coins`).join('\n')) : codeBlock('...')) }
                            )
                            .setDescription(`Please enter the items you would like to trade. For fish, enter the identifier. The trade request will`
                                + ` be cancelled automatically after **5 minutes**.\n${blockQuote(`**[${trader.username}]:** `)} ❌\n**[${partner.username}]:** ❌`)
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
                if (ButtonInteraction.user == trader) traderConfirmed = true
                else if (ButtonInteraction.user == partner) partnerConfirmed = true

                await ButtonInteraction.update({
                    embeds: [
                        embed
                            .setDescription(`Please enter the items you would like to trade. For fish, enter the identifier. The trade request will`
                                + ` be cancelled automatically after **5 minutes**.\n${blockQuote(`**[${trader.username}]:** `)}` + `${traderConfirmed ? '✅' : '❌'}\n**[${partner.username}]:** ${partnerConfirmed ? '✅' : '❌'}`)
                    ]
                })
            }

            if (buttonId == 'finalize') {

                return;
            }
            if ((traderConfirmed && partnerConfirmed)) {
                collector.stop();

                const finalizeButton = new MessageButton()
                    .setLabel("Finalize")
                    .setEmoji("🔒")
                    .setStyle("PRIMARY")
                    .setCustomId("finalize")

                    row = new MessageActionRow().setComponents(cancelButton, finalizeButton)

                    ButtonInteraction.editReply({
                        embeds: [
                            embed
                            .setDescription("Please take a moment to verify that you would like to accept this trade. I will **NOT** restore scammed items.")
                        ], 
                        components: [row]
                    })
            }

        })


    }
}
