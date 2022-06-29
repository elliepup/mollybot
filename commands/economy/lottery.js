const { SlashCommandBuilder, blockQuote } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton, MessageActionRow } = require('discord.js');
const { LotteryEntry } = require('../../models/LotteryEntry');
const { User, getTieredCoins } = require('../../models/User');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('lottery')
        .setDescription(`Play the lottery!`),
    async execute(interaction) {

        let user = await User.findOne({ userId: interaction.user.id }) || await User.create({ userId: interaction.user.id });
        let userLottery = await LotteryEntry.findOne({ user: user}) || await LotteryEntry.create({ user: user });
        let mollyUser = await User.findOne( { userId: "911276391901843476" } )
        
        const cancelButton = new MessageButton()
            .setLabel('Cancel')
            .setStyle('DANGER')
            .setEmoji('✖️')
            .setCustomId('cancel')
            .setDisabled(true)
        const ticketButton = new MessageButton()
            .setLabel('Buy Ticket (250 coins)')
            .setStyle('SUCCESS')
            .setEmoji('🎟️')
            .setCustomId('ticket')
            .setDisabled(true)
        const row = new MessageActionRow().addComponents(cancelButton, ticketButton)

        const embed = new MessageEmbed()
            .setTitle('Welcome to the Lottery!')
            .setDescription(blockQuote(`Every time you work or sell an item, a small percentage of your coins will be given to **Molly Bot**.` + 
            ` Every week, **Molly Bot** will give these coins away using the lottery system. You can buy a ticket by clicking the button below.` +
            ` The more tickets you buy (with a maximum of 10 entries), the more chance you have of winning the jackpot.`))
            .addField('Tickets', `\`${userLottery.tickets}\` 🎟️`, true)
            .addField('Current Jackpot', getTieredCoins(mollyUser.balance), true)
            .addField('Time Until Jackpot', getTimeUntilJackpot(), true)
            .setFooter({ text: 'This feature is currently in development and is not ready to be released yet.'})
            .setColor('WHITE')

        interaction.reply({
            embeds: [embed],
            components: [row]
        })
        
    }
}

//get hh:mm:ss until 8 pm EST today
function getTimeUntilJackpot() {
    let now = new Date();
    let time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    let diff = time.getTime() - now.getTime();
    let seconds = Math.floor(diff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    hours %= 24;
    minutes %= 60;
    seconds %= 60;
    return `\`${hours}h ${minutes}m ${seconds}s\``;
}