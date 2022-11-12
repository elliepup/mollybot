const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow, ButtonInteraction } = require('discord.js');
const { EconData } = require('../../models/EconProfile')
const { User, getTieredCoins } = require('../../models/User')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Gives the @mention a specified amount of coins.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount you wish to donate.')
                .setRequired(true)),
    async execute(interaction) {

        const donor = interaction.user;
        const target = interaction.options.getUser("target");
        const amount = interaction.options.getInteger("amount");

        let user = await User.findOne({ userId: donor.id }) || await User.create({ userId: donor.id });
        const userEcon = await EconData.findOne({ user: user }) || await EconData.create({ user: user });
        const userBalance = user.balance;

        const targetUser = await User.findOne({ userId: target.id }) || await User.create({ userId: target.id });


        //verify that the user has entered a valid amount and target
        if (amount <= 0) return interaction.reply({
            content: "Please enter a valid number of coins to donate.",
            ephemeral: true,
        })
        if (donor == target) return interaction.reply({
            content: "You can't donate to yourself.",
            ephemeral: true,
        })

            if (amount > userBalance) return interaction.reply({
                content: "You don't have that many coins to donate!",
                ephemeral: true,
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
            .setTitle("Donation request received!")
            .setDescription(`${donor.username}, please confirm that you wish to donate the following amount to ${target.username}.`)
            .addField("Donation amount", `${getTieredCoins(amount)}`, true)
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
            row.components.forEach(element => { element.setDisabled(true) });
            const buttonId = (ButtonInteraction.first().customId)

            user = await User.findOne({ userId: donor.id })
            if(user.balance < amount) return interaction.editReply({
                embeds: [
                    embed
                    .setColor('#FC0000')
                    .setDescription('The amount you wish to donate exceeds your current balance.')
                ],
                components: [row]
            })

            if (buttonId == "cancel") return interaction.editReply({
                embeds: [
                    embed
                        .setDescription(`The request has been cancelled by ${donor.username}. They were not feeling generous.`)
                        .setColor('#3F3F3F')
                ],
                components: [row]
            })

            await user.updateOne({ $inc: { balance: -1 * amount } })
            await targetUser.updateOne({ $inc: { balance: amount } })
            await userEcon.updateOne({ $inc: { totalDonated: amount } })

            interaction.editReply({
                embeds: [
                    embed
                    .setDescription(`${donor.username} has made a generous donation to ${target.username}.`)
                    .setColor('4ADC00')
                    .addField(`${donor.username}'s new balance`, getTieredCoins(user.balance - amount), true)
                ],
                components: [row]
            })
        })

    }

}