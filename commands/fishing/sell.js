const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const paginationEmbed = require('discordjs-button-pagination')
const { User, getTieredCoins } = require('../../models/User')
const { FishData, rarityInfo } = require('../../models/Fish');
const FishingData = require('../../models/FishingProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell your fish! Just enter the identifier.')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The identifier of the fish you wish to sell.')
                .setRequired(true)),
    async execute(interaction) {

        const identifier = interaction.options.getString('identifier');
        let targetFish = await FishData.findOne({ fishId: identifier });
        const user = await User.findOne({ userId: interaction.user.id }) || await User.create({ userId: interaction.user.id });
        
        if (!targetFish) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No fish found")
                    .setDescription("The fish you are trying to sell does not exist. Please verify that you are entering the correct ID.")
            ]
        })

        //if the fish does not belong to the user
        if (targetFish.currentOwner != interaction.user.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Unable to sell")
                    .setDescription("The fish you are trying to sell does not belong to you.")
            ]
        })

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
        const taxRate = 0.08
        const afterTax = Math.floor(targetFish.value * (1 - taxRate))
        const orig = targetFish.value

        const embed = new MessageEmbed()
            .setTitle("Selling request received!")
            .setDescription(`${interaction.user.username}, please confirm that you wish to sell your fish.`)
            .addField("Selling Price", getTieredCoins(afterTax), true)
            .addField("Rarity", (rarityInfo.find(obj => obj.rarity === targetFish.rarity).stars), true)
            .addField("Fish", `**${targetFish.type}**`, true)
            .addField(`Tax (${Math.floor(taxRate * 100)}%)`, getTieredCoins(targetFish.value - afterTax), true)
            .addField(`Information`, `\`\`\`ini\n[Identifier]: ${targetFish.fishId}\n[Fish]: ${targetFish.type}` +
                `\n[Color]: ${targetFish.color}\`\`\``)
            .setColor('E1E1E1')
            .setFooter({ text: `The tax goes to MollyBot. This money will be used for weekly lottery prizes. This system is currently in development.` })
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

            targetFish = await FishData.findOne({ fishId: identifier });

            if (buttonId == 'cancel') {
                return interaction.editReply({
                    embeds: [
                        embed
                            .setDescription(`The request has been cancelled by ${interaction.user.username}.`)
                            .setColor('#3F3F3F')
                    ],
                    components: [row]
                })
            }

            if(!targetFish) return interaction.editReply({
                embeds: [
                    embed
                    .setColor('#FC0000')
                    .setDescription('The fish has already been sold or no longer exists.')
                ],

            })

            if(targetFish.currentOwner != interaction.user.id) return interaction.editReply({
                embeds: [
                    embed
                    .setColor('#FC0000')
                    .setDescription('The fish you are trying to sell belongs to someone else.')
                ]
            })

            await targetFish.remove()

            const mollyUser = await User.findOne({userId: "911276391901843476"}) ||  await User.create({userId: "911276391901843476"})
            await mollyUser.updateOne({$inc: {balance: orig - afterTax}})

            await user.updateOne({$inc:{balance: afterTax}})
                .then(() => {
                    return interaction.editReply({
                        embeds: [
                            embed
                            .setColor('4ADC00')
                            .setDescription("You have successfully sold your fish! Enjoy the extra cash.")
                        ],
                        components: [row]
                    })
                })
        }
        )
    }
}

