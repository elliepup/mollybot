const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile')
const paginationEmbed = require('discordjs-button-pagination')
const FishingData = require('../../models/FishingProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gift')
        .setDescription('Gift one of your fish to another person.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person you wish to give a fish to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The identifier of the fish.')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser("target");
        let targetFish = await FishData.findOne({ fishId: interaction.options.getString('identifier') });
        const fishingProfile = await FishingData.findOne({ userId: interaction.userId }) || await FishingData.create({ userId: interaction.userId })

        //if the fish does not exist
        if (!targetFish) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No fish found")
                    .setDescription("The fish you are trying to gift does not exist. Please verify that you are entering the correct ID.")
            ]
        })

        //if the fish does not belong to the user
        if (targetFish.currentOwner != interaction.user.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Unable to gift")
                    .setDescription("The fish you are trying to gift does not belong to you.")
            ]
        })

        //TODO add confirmation 
        //prevent duplication

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

        const row = new MessageActionRow().addComponents(cancelButton, confirmButton)

        const embed = new MessageEmbed()
            .setTitle("Gift request received!")
            .setDescription(`${interaction.user.username}, please confirm that you wish to gift the following fish to ${target.username}.` +
            ` This fish has a value of ${getTieredCoins(targetFish.value)}.`)
            .addField(`Information`, `\`\`\`ini\n[Identifier]: ${targetFish.fishId}\n[Fish]: ${targetFish.type}` +
            `\n[Color]: ${targetFish.color}\`\`\``)
            .setColor('E1E1E1')
            .setFooter({text: `Don't DM me if you get scammed because I don't care and won't give it back.`})
        interaction.reply({
            embeds: [embed],
            components: [row]
        })

        const message = await interaction.fetchReply();

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        }

        const collector = message.createMessageComponentCollector({
            filter,
            max: 1
        })

        collector.on('end', async (ButtonInteraction) => {

            const buttonId = (ButtonInteraction.first().customId)
            row.components.forEach(element => { element.setDisabled(true) });
            if (buttonId == 'cancel') {
                return interaction.editReply({
                    embeds: [
                        embed
                            .setDescription(`The request has been cancelled by ${interaction.user.username}. They were not feeling generous.`)
                            .setColor('#3F3F3F')
                    ],
                    components: [row]
                })
            }
            row.components.forEach(element => { element.setDisabled(true) });

            targetFish = await FishData.findOne({ fishId: interaction.options.getString('identifier') });
            if(!targetFish) return interaction.editReply({
                embeds: [
                    embed
                    .setColor('#FC0000')
                    .setDescription('The fish has already been sold or no longer exists.')
                ],
                components: [row]
            })

            if(targetFish.currentOwner != interaction.user.id) return interaction.editReply({
                embeds: [
                    embed
                    .setColor('#FC0000')
                    .setDescription('The fish no longer belongs to you.')
                ],
                components: [row]
            })


            await targetFish.updateOne({ currentOwner: target.id })
                .then(() => {

                    interaction.editReply({
                        embeds: [
                            embed
                                .setColor('4ADC00')
                                .setDescription(`${interaction.user.username} has successfully gifted a fish to ${target.username}!`)
                        ],
                        components: [row]
                    })
                })

        })

    }
}