const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { User, getTieredCoins } = require('../../models/User')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('Displays the fish given the unique identifier.')
        .addStringOption(option =>
            option.setName('identifier')
                .setDescription('The ID of the fish.')
                .setRequired(true)),
    async execute(interaction) {

        const targetFish = await FishData.findOne({ fishId: interaction.options.getString('identifier') });
        if (!targetFish) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No fish found")
                    .setDescription("The fish you are trying to search for does not exist. Please verify that you are entering the correct ID.")
            ]
        })

        const shiny = targetFish.shiny;

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`Fish Details: \`${targetFish.fishId}\``)
                    .setColor((!shiny) ? rarityInfo.find(obj => obj.rarity === targetFish.rarity).hex : `#FF0074`)
                    .setDescription(`Current Owner: <@${targetFish.currentOwner}>`)
                    .addField("Caught By", `<@${targetFish.originalOwner}>`, true)
                    .addField("Caught On", `\`${targetFish.catchDate.toLocaleDateString('en-US')}\``, true)
                    .addField("Fish", (!shiny) ? (`\`${targetFish.type}\``) : (`\`⭐${targetFish.type}⭐\``), true)
                    .addField("Rarity", (targetFish.rarity != 'Event') ? `\`${rarityInfo.find(obj => obj.rarity === targetFish.rarity).stars}\`` : `<a:CongratsWinnerConfetti:993186391628468244>`, true)
                    .addField("Value", `${getTieredCoins(targetFish.value)}`, true)
                    .addField("Stats", `**Length:** ${(targetFish.length > 24) ? `\`${(targetFish.length / 12).toFixed(1)} ft\`` : `\`${targetFish.length} in\``}` +
                        `\n**Weight:** \`${targetFish.weight.toString()} lb\`\n**Color:** \`${targetFish.color}\`${(shiny) ? `\n⭐**Shiny**⭐` : ""}`)
                    .setThumbnail((!shiny) ? `attachment://${targetFish.fishNo}.png` : `attachment://${targetFish.fishNo}.png`)

            ], files: [(!shiny) ? `./extras/${targetFish.fishNo}.png` : `./extras/shiny/${targetFish.fishNo}.png`]
        })



    }

}
