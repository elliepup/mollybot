const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { User, getTieredCoins } = require('../../models/User')
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Allows you to unlock a fish to enable the sale of it.')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The identifier of the fish you want to unlock.')
                .setRequired(true)),
    async execute(interaction) {
        const identifier = interaction.options.getString("identifier");
        const fishData = await FishData.findOne({ fishId: identifier });
        if (!fishData) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle("<:yukinon:839338263214030859> No fish found")
                .setDescription(`No fish found with the identifier ${identifier}.`)
            ]
        })
        //if the fish does not belong to the user
        if (fishData.currentOwner !== interaction.user.id) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle("<:yukinon:839338263214030859> Unable to lock")
                .setDescription(`The fish you are trying to lock does not belong to you.`)
            ]
        })
        if (!fishData.locked) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle("<:yukinon:839338263214030859> Fish already unlocked")
                .setDescription(`The fish \`${fishData.fishId}\` · \`${fishData.type}\` is already unlocked.`)
            ]
        })
        await FishData.updateOne({ fishId: identifier }, { $set: { locked: false } });
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#03fc84')
                .setTitle("Fish successfully unlocked")
                .setDescription(`The fish \`${fishData.fishId}\` · \`${fishData.type}\` has been unlocked.`)
                .setFooter({text: `By unlocking a fish, you are enabling its sale. To lock it again, use the /lock command.`})
            ]
        })
    }
}
