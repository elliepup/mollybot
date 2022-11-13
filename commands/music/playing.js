const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('playing')
        .setDescription('Shows information about the song that is currently playing.'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        //if a queue hasn't been created or there is no song at the top of the queue
        if (!queue || !queue.current) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        const currentSong = queue.current;
        const progressBar = queue.createProgressBar(true, false, 10);
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#00B6FF ')
                    .setTitle("Current Song")
                    .setThumbnail(currentSong.thumbnail)
                    .setDescription(`[${currentSong.title}](${currentSong.url})`)
                    .addFields({ 'name': 'Song progress', 'value': `[${queue.getPlayerTimestamp().current}] ${progressBar} [${currentSong.duration}]` })
                    .setFooter({ text: `Requested by ${currentSong.requestedBy.username}`, iconURL: currentSong.requestedBy.displayAvatarURL({ dynamic: true }) })
            ]
        })
    }
}