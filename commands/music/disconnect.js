const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects the bot from the voice channel.'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return await interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })
        
        client.player.deleteQueue(interaction.guildId)
        client.player.voiceUtils.disconnect(queue.connection);
        

        return await interaction.reply({
            content: "Successfully disconnected from the voice channel.",
            ephemeral: true,
        })
    }
}