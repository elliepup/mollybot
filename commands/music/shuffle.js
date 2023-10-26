const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Skips the song that is currently playing'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        if (!queue || !queue.current) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        queue.shuffle();
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#00B6FF ')
                    .setTitle("Queue Shuffled")
                    .setDescription(`The queue has been shuffled by <@${interaction.user.id}>.`)
            ]
        })

    }

}
