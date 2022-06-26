const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { getTieredCoins } = require('../../models/EconProfile');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Displays the shop and items that you can buy.'),
    async execute(interaction) {

        const shopItems = require('../../data/shopdata')
        const embed = new MessageEmbed() 
        .setTitle("Molly Bot Shop")
        .setColor('#B4FFF3')
        .setDescription(shopItems.map((item, index) => `**${item.name}** · ${getTieredCoins(item.price)}` + 
        `\`\`\`${item.description}\`\`\``).join('\n'))
        .setFooter({text: "Use the /buy command to buy things off the shop!"})
        
        //var hr = (new Date()).getHours()
        
        interaction.reply({
            embeds: [embed]
        })
    }

}
