const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription('Disconnects the bot from the voice channel.'),
    async execute(interaction) {
        const client = require('../../src/index')
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        client.player.voiceUtils.disconnect(queue.connection);
        client.player.deleteQueue(interaction.guildId)

        return interaction.reply({
            content: "Successfully disconnected from the voice channel.",
            ephemeral: true,
        })
    }
}

