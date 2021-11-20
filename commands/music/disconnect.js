const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription(`Disconnects from the voice channel the user is in.`),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId)

        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })
            player.voiceUtils.disconnect(queue.connection);
            player.deleteQueue(interaction.guildId)

            return interaction.reply({ 
                content: "Successfully disconnected from the voice channel.",
                ephemeral: true,
            })
            
    }
}