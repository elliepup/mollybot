const { SlashCommandBuilder, blockQuote } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const { LotteryEntry } = require('../../models/LotteryEntry');
const { User, getTieredCoins } = require('../../models/User');
const { ClientInfo } = require('../../models/ClientInfo');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lottery')
        .setDescription(`Play the lottery!`),
    async execute(interaction) {

        let user = await User.findOne({ userId: interaction.user.id }) || await User.create({ userId: interaction.user.id });
        let userLottery = await LotteryEntry.findOne({ user: user }) || await LotteryEntry.create({ user: user });
        let mollyUser = await User.findOne({ userId: "911276391901843476" })
        let balance = user.balance;

        const clientInfo = await ClientInfo.findOne({}) || await ClientInfo.create({});
        const lastWinner = await User.findById(clientInfo.lastJackpotWinner) || null;

        const maximumTickets = 10;
        const interactionTimeout = 60000;
        const ticketPrice = 250;

        const cancelButton = new MessageButton()
            .setLabel('Cancel')
            .setStyle('DANGER')
            .setEmoji('✖️')
            .setCustomId('cancel')
        const ticketButton = new MessageButton()
            .setLabel('Purchase Ticket')
            .setStyle('PRIMARY')
            .setEmoji('🎟️')
            .setCustomId('ticket')
        const row = (userLottery.tickets < maximumTickets && balance > ticketPrice) ? new MessageActionRow().addComponents(cancelButton, ticketButton)
            : new MessageActionRow().addComponents(cancelButton, ticketButton.setDisabled(true))


        const embed = new MessageEmbed()
            .setTitle('Welcome to the Lottery!')
            .setDescription(blockQuote(`Every time you work or sell an item, a small percentage of your coins will be given to **Molly Bot**.` +
                ` Every week, **Molly Bot** will give these coins away using the lottery system. You can buy a ticket by clicking the button below.` +
                ` The more tickets you buy (with a maximum of ${maximumTickets} entries), the more chance you have of winning the jackpot.`))
            .setFields([{ name: 'Tickets', value: `\`${userLottery.tickets}\`🎟️`, inline: true }, { name: 'Current Jackpot', value: getTieredCoins(mollyUser.balance), inline: true },
            { name: 'Time Until Jackpot', value: `<t:${Math.floor(getNextFriday()/1000)}>`, inline: true }, { name: 'Current Balance', value: getTieredCoins(user.balance), inline: true }
                , { name: 'Ticket Price', value: getTieredCoins(ticketPrice), inline: true }, { name: 'Last Winner', value: (lastWinner) ? `<@${lastWinner.userId}>` : `\`N/A\``, inline: true }])
            .setFooter({ text: 'This feature is currently in development. You will automatically be entered into the first drawing.' })
            .setColor('WHITE')

        await interaction.reply({
            embeds: [embed],
            components: [row]
        })

        //create filter and collector

        const message = await interaction.fetchReply();
        const filter = i => { return i.user.id === interaction.user.id; }
        const collector = message.createMessageComponentCollector({ filter, time: interactionTimeout })

        collector.on('collect', async (ButtonInteraction) => {
            if (ButtonInteraction.customId == 'cancel') {
                row.components.forEach(component => { component.setDisabled(true) });
                collector.stop();
                await ButtonInteraction.update({
                    embeds: [
                        embed
                            .setDescription(blockQuote(`Thank you for playing the lottery! We wish you the best of luck!` +
                                ` You can always come back and play again by typing \`/lottery\`.`))
                    ],
                    components: [row]
                })
            } else if (ButtonInteraction.customId == 'ticket') {
                userLottery = await LotteryEntry.findOne({ user: user });
                user = await User.findOne({ userId: interaction.user.id });

                if (user.balance < ticketPrice) {
                    row.setComponents(cancelButton, ticketButton.setDisabled(true));
                    return ButtonInteraction.update({
                        embeds: [embed], components: [row]
                    })
                }

                collector.resetTimer(interactionTimeout);
                if (userLottery.tickets >= maximumTickets) {
                    await ButtonInteraction.update({
                        embeds: [embed],
                        components: [row.setComponents(cancelButton, ticketButton.setDisabled(true))]
                    })
                }

                if (userLottery.tickets < maximumTickets) {
                    userLottery.tickets++;
                    user.balance -= ticketPrice;
                    await user.save();
                    await userLottery.save();
                    await mollyUser.updateOne({ $inc: { balance: Math.floor(ticketPrice * 0.9) } });
                    await ButtonInteraction.update({
                        embeds: [
                            embed
                                .setFields([{ name: 'Tickets', value: `\`${userLottery.tickets}\`🎟️`, inline: true }, { name: 'Current Jackpot', value: getTieredCoins(mollyUser.balance), inline: true },
                                { name: 'Time Until Jackpot', value: `<t:${Math.floor(getNextFriday()/1000)}>`, inline: true }, { name: 'Current Balance', value: getTieredCoins(user.balance), inline: true },
                                { name: 'Ticket Price', value: getTieredCoins(ticketPrice), inline: true }, { name: 'Last Winner', value: (lastWinner) ? `<@${lastWinner.userId}>` : `\`N/A\``, inline: true }])
                        ],
                    })
                }
            }
        })

        //on collector end
        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                collector.stop();
                row.components.forEach(component => { component.setDisabled(true) });
                collector.stop();
                await interaction.editReply({
                    embeds: [
                        embed
                            .setDescription(blockQuote(`Thank you for playing the lottery! We wish you the best of luck!` +
                                ` You can always come back and play again by typing \`/lottery\`.`))
                    ],
                    components: [row]
                })
            }

        })
    }




}

//get date of next friday at 8 pm est
function getNextFriday() {
    let today = new Date();
    let easternTimeOffset = -240;
    let offset = 60 * 28;
    let friday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (5 - today.getDay()));
    friday.setMinutes(friday.getMinutes() + offset + easternTimeOffset);
    return friday.getTime();
}