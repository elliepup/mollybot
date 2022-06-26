const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const paginationEmbed = require('discordjs-button-pagination')
const { MessageEmbed, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('View all the songs that are currently in the queue.'),
    async execute(interaction) {
        const client = require('../../src/index')
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 7;

        const allSongs = [queue.current, ...queue.tracks];
        const chunks = sliceIntoChunks(allSongs, maxItemsPerPage);

        const leftButton = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('◀')
            .setStyle('SECONDARY');
        const rightButton = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('▶')
            .setStyle('SECONDARY');
        buttons.push(leftButton, rightButton)

        for(let i = 0; i < Math.ceil(allSongs.length/maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
            .setColor('#03fc84')
            .setTitle("🎶Songs in the queue🎶")
            .addField(`Total songs: ${allSongs.length} · [${formatTime(queue.totalTime/1000)}]`, chunks[i].map((k, index) => `${bold('#' + (i*maxItemsPerPage + index + 1) + ': ')}`
            + `[${k.title.length < 40 ? k.title : k.title.substring(0,39) + "..."}](${k.url}) **[${k.duration}]**`).join('\n'))
            pages.push(embed)
        }

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

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}