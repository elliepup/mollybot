const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed, MessageButton } = require('discord.js')
const paginationEmbed = require('discordjs-button-pagination')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('See everyone ranked by wealth!'),
    async execute(interaction) {

        const leaderboardData = await getLeaderboardData()
        
        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 10;

        const chunks = sliceIntoChunks(leaderboardData, maxItemsPerPage);

        for(let i =0; i < Math.ceil(leaderboardData.length/maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
            .setColor(`#F8FF00`)
            .setTitle('Leaderboard')
            .addField(`\u200B`, chunks[i].map((k, index) => `**#${i*maxItemsPerPage + index + 1}**: <@${k[1]}> \`${k[0]}\` <:YukiBronze:872106572275392512>`).join(`\n`))

            pages.push(embed);
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

const getLeaderboardData = async () => {
    const axios = require('axios');
        
        const config = {
            headers: {
                'fauna-secret': process.env.FAUNA_SERVER_SECRET
            }
        }
        await axios.get(`http://localhost:3000/leaderboard`, config)
            .then(response => {
                users = response.data.data;
            })
        return users;
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}