const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')

const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the song that is currently playing.'),
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

        const currentSong = queue.current;
        queue.setPaused(true)
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#00B6FF ')
                    .setTitle("Song Paused")
                    .setDescription(`[${currentSong.title}](${currentSong.url}) has been paused by <@${interaction.user.id}>.`)
            ]
        })
    }
}

