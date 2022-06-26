const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')

const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the song that is currently playing.'),
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
        queue.setPaused(false)
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#00B6FF ')
                    .setTitle("Song Unpaused")
                    .setDescription(`[${currentSong.title}](${currentSong.url}) has been unpaused by <@${interaction.user.id}>.`)
            ]
        })
    }
}

