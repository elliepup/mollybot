const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile')
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('Displays the collection of fish of the target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose collection of fish you want to see.')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('sort_by')
                .setDescription('The value you would like to order by.'))
        .addStringOption(option =>
            option.setName('order')
                .setDescription(`Type 'd' for descending or 'a' for ascending.`)),
    async execute(interaction) {
        const target = interaction.options.getUser("target") || interaction.user;
        const fishData = await FishData.find({ currentOwner: target.id }).sort({ value: 'desc' });
        
        if(!fishData.length) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle("<:yukinon:839338263214030859> No fish in collection")
                .setDescription(`${target.username} currently has no fish. In order to get fish, use the /fish command.`)
            ]
        })


        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 8;
        const chunks = sliceIntoChunks(fishData, maxItemsPerPage);
        for (let i = 0; i < Math.ceil(fishData.length / maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
                .setColor('#03fc84')
                .setTitle(`Fish Collection`)
                .setDescription(`Fish carried by <@${target.id}>`)
                .addField(`\u200B`, chunks[i].map((k, index) => `\`${k.fishId}\` · \`${rarityInfo.find(obj => obj.rarity === k.rarity).stars}\` · \`${((k.length > 24) ? (k.length/12).toFixed(1) + " ft      " : k.length + " in    ").substring(0,8)}\` ·` 
                 + ` \`${((k.weight > 4000) ? (k.weight/2000).toFixed(1) + " tons" : k.weight + " lb     ").substring(0,9)}\` · \`${(k.value)}\` <:YukiBronze:872106572275392512> · **${k.type}**${(k.shiny) ? ` ★` : ""}`).join(`\n`))
            pages.push(embed)
        }

        const leftButton = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('◀')
            .setStyle('SECONDARY');
        const rightButton = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('▶')
            .setStyle('SECONDARY');
        buttons.push(leftButton, rightButton)

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