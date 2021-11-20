const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const paginationEmbed = require('discordjs-button-pagination')
const { MessageEmbed, MessageButton } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription(`Displays the current song queue.`),
    async execute(interaction) {
        const player = require('../../src/index')
        const queue = player.getQueue(interaction.guildId);

        if (!queue?.playing) return interaction.reply({
            content: "There currently are no songs in queue.",
            ephemeral: true,
        });

        const pages = [];
        const buttons = [];
        const timeout = '60000';
        const maxItemsPerPage = 7;
        
        const allSongs = [queue.current, ...queue.tracks];
        const chunks = sliceIntoChunks(allSongs, maxItemsPerPage);

        for(let i = 0; i < Math.ceil(allSongs.length/maxItemsPerPage); i++) {
            const embed = new MessageEmbed()
            .setColor('#03fc84')
            .setTitle("🎶Songs in the queue🎶")
            .addField(`Total songs: ${allSongs.length}`, chunks[i].map((k, index) => `${bold('#' + (i*maxItemsPerPage + index + 1) + ': ')}`
            + `[${k.title.length < 40 ? k.title : k.title.substring(0,39) + "..."}](${k.url}) **[${k.duration}]**`).join('\n'))
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