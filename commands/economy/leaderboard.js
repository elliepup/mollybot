const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageButton } = require('discord.js')
const paginationEmbed = require('discordjs-button-pagination')
const { User } = require('../../models/User')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See everyone ranked by wealth!'),
    async execute(interaction) {

        const leaderboardData = await User.find({}).sort({balance: 'desc'});
        
        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 10;

        const chunks = sliceIntoChunks(leaderboardData, maxItemsPerPage);
        for(let i = 0; i < Math.ceil(leaderboardData.length/maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
            .setColor('#03fc84')
            .setTitle("Leaderboard")
            .addField(`\u200B`, chunks[i].map((k, index) => `**#${i*maxItemsPerPage + index + 1}:** <@${k.userId}> \`${k.balance}\` <:YukiBronze:872106572275392512>`).join(`\n`))
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