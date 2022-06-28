const { SlashCommandBuilder, blockQuote, codeBlock } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { getTieredCoins } = require('../../models/EconProfile');
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Displays the shop and items that you can buy.'),
    async execute(interaction) {

        //set up pagination
        
        const shopItems = require('../../data/shopdata')
        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 3;
        const leftButton = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('◀')
            .setStyle('SECONDARY');
        const rightButton = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('▶')
            .setStyle('SECONDARY');
        buttons.push(leftButton, rightButton)
        
        const chunks = sliceIntoChunks(shopItems, maxItemsPerPage);
        for (let i = 0; i < Math.ceil(shopItems.length / maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
                .setColor('#03fc84')
                .setTitle(`Molly Bot Shop`)
                .setDescription(`If you would like to make a purchase, you can type \`/buy <item name>\`. There are autocompletes for the item name.`)
                .addField(`More coming soon!`, chunks[i].map(item => `**${item.name}** ${getTieredCoins(item.price)}\n` + codeBlock("diff",`${item.description}\n+ ${item.use}`)).join(`\n`))
                pages.push(embed);
        }
        paginationEmbed(interaction, pages, buttons, timeout)

        const embed = new MessageEmbed() 
        .setTitle("Molly Bot Shop")
        .setColor('#B4FFF3')
        .setDescription(shopItems.map((item) => `**${item.name}** · ${getTieredCoins(item.price)}` + 
        `\`\`\`${item.description}\`\`\``).join('\n'))
        
    }

}

//split into chunks of size n
function sliceIntoChunks(array, n) {
    var result = [];
    for (var i = 0; i < array.length; i += n) {
        result.push(array.slice(i, i + n));
    }
    return result;
}