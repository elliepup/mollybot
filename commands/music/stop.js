const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops playing music and deletes the queue.'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return await interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        queue.stop();

        await interaction.reply({
            embeds: [new EmbedBuilder()
                .setColor('#00DEFF')
                .setTitle('Queue Stopped')
                .setDescription(`<@${interaction.user.id}> has stopped the player and cleared the queue.`)
            ]
        })
    }
}