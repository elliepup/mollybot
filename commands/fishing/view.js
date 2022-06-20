const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('Displays the fish given the unique identifier.')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The ID of the fish.')
                .setRequired(true)),
    async execute(interaction) {

        const targetFish = await FishData.findOne({fishId: interaction.options.getString('identifier')});
        if(!targetFish) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle("<:yukinon:839338263214030859> No fish found")
                .setDescription("The fish you are trying to search for does not exist. Please verify that you are entering the correct ID.")
            ]
        })

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle(`Fish Details: \`${targetFish.fishId}\``)
                .setColor(rarityInfo.find(obj => obj.rarity === targetFish.rarity).hex)
                .setDescription(`Current Owner: <@${targetFish.currentOwner}>`)
                .addField("Caught By", `<@${targetFish.originalOwner}>`, true)
                .addField("Caught On", `\`${targetFish.catchDate.toLocaleDateString('en-US')}\``, true)
                .addField("Fish", `\`${targetFish.type}\``, true)
                .addField("Rarity", `\`${rarityInfo.find(obj => obj.rarity === targetFish.rarity).stars}\``, true)
                .addField("Value", `${getTieredCoins(targetFish.value)}`, true)
                .addField("Stats", `**Length:** ${(targetFish.length > 24) ? `\`${(targetFish.length/12).toFixed(1)} ft\`` : `\`${targetFish.length} in\``}` + 
                `\n**Weight:** \`${targetFish.weight.toString()} lb\`\n**Color:** \`${targetFish.color}\``)
                
            ]
        })

        
        
    }

}
