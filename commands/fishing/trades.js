const { SlashCommandBuilder, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment, MessageButton } = require('discord.js');
const TradeData = require('../../models/TradeRecord')
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trades')
        .setDescription('Views the trade history of a player.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose trades you want to view.')
                .setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser('target') || interaction.user;
        const tradeRecords = await TradeData.find({ $or: [{ traderId: target.id }, { partnerId: target.id }] }).sort({ timeCompleted: 'desc' });

        if (!tradeRecords.length) return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No trades found")
                    .setDescription(`${target.username} currently has no trade history.`)
            ]
        })

        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 8;
        const chunks = sliceIntoChunks(tradeRecords, maxItemsPerPage);

        const leftButton = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('◀')
            .setStyle('SECONDARY');
        const rightButton = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('▶')
            .setStyle('SECONDARY');
        buttons.push(leftButton, rightButton)

        for (let i = 0; i < Math.ceil(tradeRecords.length / maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
                .setColor('#03fc84')
                .setTitle(`User Trades`)
                .setDescription(`Confirmed trades by <@${target.id}>. This only shows basic information. Please use /viewtrade followed by the identifier to view more information.`)
                .addField(`Total trades: ${tradeRecords.length}`, `${tradeRecords.map(x => `\`${x.tradeId}\` · <t:${Math.floor(x.timeCompleted/1000)}> · ` + 
                `${(x.traderId == target.id) ? `<@${x.partnerId}>` : `<@${x.traderId}>`}`).join('\n')}`)

                pages.push(embed)
        }
        paginationEmbed(interaction, pages, buttons, timeout)
    }

}


function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}