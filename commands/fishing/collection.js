const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { User, getTieredCoins } = require('../../models/User')
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

        const fishValueTotal = fishData.reduce((acc, cur) => acc + cur.value, 0);

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
                .addField(`Collection Value: ${getTieredCoins(fishValueTotal)}`, chunks[i].map((k, index) => ((k.locked) ? `🔒` : `🔓`) +
                `\`${k.fishId}\` · ${(k.rarity != `Event`) ? `\`${rarityInfo.find(obj => obj.rarity === k.rarity).stars}\`` : (`\`«Event»\``) } · \`${((k.length > 24) ? (k.length/12).toFixed(1) + " ft      " : k.length + " in    ").substring(0,7)}\` ·` 
                 + ` \`${((k.weight > 4000) ? (k.weight/2000).toFixed(1) + " tons" : k.weight + " lb     ").substring(0,7)}\` · \`${displayValue(k.value)}\` <:YukiBronze:872106572275392512> · **${k.type}**${(k.shiny) ? `★` : ""}`).join(`\n`))
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

function displayValue(value) {
    if (value < 1000) {
        return value;
    } else if (value < 1000000) {
        return (value / 1000).toFixed(1) + "k";
    } else if (value < 1000000000) {
        return (value / 1000000).toFixed(1) + "m";
    } else {
        return (value / 1000000000).toFixed(1) + "b";
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