const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song.'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        if (!queue || !queue.current) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        const currentSong = queue.current;
        queue.setPaused(true)
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#00B6FF ')
                    .setTitle("Song Unpaused")
                    .setDescription(`[${currentSong.title}](${currentSong.url}) has been paused by <@${interaction.user.id}>.`)
            ]
        })


    }
}