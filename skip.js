const { SlashCommandBuilder } = require('@discordjs/builders');
const client = require('../../src/index')
const { Player } = require('discord-player')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the song that is currently playing'),
    async execute(interaction) {

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
        queue.skip()
            .then(() => {
                return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#00B6FF ')
                            .setTitle("Song Skipped")
                            .setDescription(`[${currentSong.title}](${currentSong.url}) has been skipped by <@${interaction.user.username}>.`)
                    ]
                })
            })

    }

}
