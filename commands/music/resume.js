const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription(`Resumes the song at the top of the queue.`),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId);

        if(!queue?.playing) return interaction.reply({
            content: "There currently are no songs in queue.",
            ephemeral: true,
        });

        queue.setPaused(false);

        interaction.reply({
            content: "Song resumed!",
        })
    }
}