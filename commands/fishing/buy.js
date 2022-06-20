const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const { EconData, getTieredCoins } = require('../../models/EconProfile')
const FishingData  = require('../../models/FishingProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Allows you to purchase shop items')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('The item that you want to purchase.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('quantity')
                .setDescription('The quantity of the item you want to purchase.')
            ),
    async execute(interaction) {
        const shopData = require('../../data/shopdata')
        const quantity = interaction.options.getInteger('quantity') || 1
        purchaseItem = shopData.filter((obj) => { return obj.name.toLowerCase() == interaction.options.getString('item').toLowerCase() })[0]
        const econProfile = await EconData.findOne({ userId: interaction.user.id }) || await EconData.create({ userId: interaction.user.id })
        const fishingProfile = await FishingData.findOne(({ userId: interaction.user.id }) || await FishingData.create({ userId: interaction.user.id }))
        const balance = econProfile.balance

        if (quantity < 1) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Invalid quantity")
                    .setDescription("Please enter a number greater than 0 for the quantity.")
            ]
        })
        if (econProfile.isBuying == true) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Already buying")
                    .setDescription("You are already attempting to buy an item! Please try again after you have finalized the transaction.")
            ]
        })

        //put item check here
        if(!purchaseItem) return interaction.reply({ 
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Item not found")
                    .setDescription("The item you are trying to buy does not exist. Please check the spelling or open the /shop to see the names of items.")
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

        


        
        await econProfile.updateOne({ isBuying: true })
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
            if (buttonId == 'cancel') {
                await econProfile.updateOne({ isBuying: false })
                return interaction.editReply({
                    embeds: [
                        embed
                            .setDescription(`The request has been cancelled by ${interaction.user.username}.`)
                            .setColor('#3F3F3F')
                    ],
                    components: [row]
                })
            }

            //put logic for buying stuff here
            await econProfile.updateOne({ isBuying: false })
            await econProfile.updateOne({$inc: {balance: -1 * cost}})
            interaction.editReply({
                embeds: [
                    embed
                    .setColor('4ADC00')
                    .setDescription(`You have successfully purchased **${purchaseItem.name}**! Enjoy your new goodies.`)
                ],
                components: [row]
            })
            switch(purchaseItem.name.toLowerCase()){
                case("tier one bait"):  await fishingProfile.updateOne({$inc: {tierOneBait: quantity}}); break
                case("tier two bait") :  await fishingProfile.updateOne({$inc: {tierTwoBait: quantity}}); break
                case('tier three bait'):  await fishingProfile.updateOne({$inc: {tierThreeBait: quantity}}); break
                case('tier four bait') :  await fishingProfile.updateOne({$inc: {tierFourBait: quantity}}); break
            }

        })


    }

}
