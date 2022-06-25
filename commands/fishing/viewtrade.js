const { SlashCommandBuilder, blockQuote, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { getTieredCoins } = require('../../models/EconProfile');
const TradeData = require('../../models/TradeRecord');
const {  rarityInfo } = require('../../models/Fish')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewtrade')
        .setDescription('Allows you to view a trade that has occurred provided an identifier.')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('Identifier of the trade.')
                .setRequired(true)),
    async execute(interaction) {

        const identifier = interaction.options.getString('identifier')
        const trade = await TradeData.findOne( { tradeId: identifier} )
        if(!trade) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Invalid identifier")
                        .setDescription("A trade with the provided identifier does not exist. Please make sure that you have entered it properly.")
                ]
            })
        }
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FFFFFF')
                .setTitle(`Viewing Past Trade: \`${identifier}\``)
                .setDescription(`This trade between <@${trade.traderId}> and <@${trade.partnerId}> was completed on <t:${Math.floor(trade.timeCompleted.getTime()/1000)}>.`)
                .addField(`\u200B`, `<@${trade.traderId}> \n${codeBlock(trade.traderFishOffering.map(x => `${x.fishId} · ${rarityInfo.find(k => k.rarity == x.rarity).stars}` +
                ` · ${x.type} · ${x.value} coins`).join('\n'))}`)
                .addField(`\u200B`, `<@${trade.partnerId}> \n${codeBlock(trade.partnerFishOffering.map(x => `${x.fishId} · ${rarityInfo.find(k => k.rarity == x.rarity).stars}` +
                ` · ${x.type} · ${x.value} coins`).join('\n'))}`)
            ]
        })
    }

}
