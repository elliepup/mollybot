const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const { EconData } = require('../../models/EconProfile')
const FishingData = require('../../models/FishingProfile')
const { User, getTieredCoins } = require('../../models/User')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Allows you to purchase shop items')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item that you want to purchase.')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('The quantity of the item you want to purchase.')
        ),
    autocompleteOptions: ['tier one bait', 'tier two bait', 'tier three bait', 'tier four bait', "fishing rod upgrade"],
    async execute(interaction) {
        const shopData = require('../../data/shopdata')
        const quantity = interaction.options.getInteger('quantity') || 1
        purchaseItem = shopData.filter((obj) => { return obj.name.toLowerCase() == interaction.options.getString('item').toLowerCase() })[0]

        const userId = interaction.user.id;

        let user = await User.findOne({ userId: userId }) || await User.create({ userId: userId });
        const userFishing = await FishingData.findOne({ user: user }) || await FishingData.create({ user: user });
        const balance = user.balance

        if (quantity < 1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Invalid quantity")
                    .setDescription("Please enter a number greater than 0 for the quantity.")
            ]
        })

        //put item check here
        if (!purchaseItem) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Item not found")
                    .setDescription("The item you are trying to buy does not exist. Please check the spelling or open the /shop to see the names of items.")
            ]
        })

        if (await !userFishing.rodLevel) {
            await userFishing.updateOne({ $set: { rodLevel: 0 } })
        }

        if (purchaseItem.name == "Fishing Rod Upgrade" && quantity > 1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Invalid quantity")
                    .setDescription("You may only purchase one fishing rod upgrade at a time.")
            ]
        })

        else if (purchaseItem.name == "Fishing Rod Upgrade" && await userFishing.rodLevel > 4) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Invalid quantity")
                    .setDescription("You already have the maximum fishing rod level.")
            ]
        })


        const cost = quantity * purchaseItem.price;

        if (cost > balance) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Not enough balance")
                    .setDescription("The cost of this item exceeds your existing balance.")
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

        const embed = new MessageEmbed()
            .setTitle("Buy request received!")
            .setDescription(`${interaction.user.username}, please confirm that you wish to buy this item.`)
            .addField('Item', `**${purchaseItem.name}**`, true)
            .addField('Quantity', `\`x${quantity}\``, true)
            .addField('Cost', getTieredCoins(cost), true)
            .setColor('E1E1E1')
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

            user = await User.findOne({ userId: userId })
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

            if (user.balance < cost) return interaction.editReply({
                embeds: [
                    embed
                        .setColor("FC0000")
                        .setDescription("You do not have enough money to complete this purchase.")
                ],
                components: [row]
            })

            //put logic for buying stuff here
            await user.updateOne({ $inc: { balance: -1 * cost } })
            interaction.editReply({
                embeds: [
                    embed
                        .setColor('4ADC00')
                        .setDescription(`You have successfully purchased **${purchaseItem.name}**! Enjoy your new goodies.`)
                ],
                components: [row]
            })
            switch (purchaseItem.name.toLowerCase()) {
                case ("tier one bait"): await userFishing.updateOne({ $inc: { tierOneBait: quantity } }); break
                case ("tier two bait"): await userFishing.updateOne({ $inc: { tierTwoBait: quantity } }); break
                case ('tier three bait'): await userFishing.updateOne({ $inc: { tierThreeBait: quantity } }); break
                case ('tier four bait'): await userFishing.updateOne({ $inc: { tierFourBait: quantity } }); break
                case ('fishing rod upgrade'): await userFishing.updateOne({ $inc: { rodLevel: 1 } }); break
            }
        })

    }

}
