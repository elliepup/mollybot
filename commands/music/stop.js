const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the player and deletes the queue.'),
    async execute(interaction) {
        const client = require('../../src/index')
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        queue.stop();

        interaction.reply({
            embeds: [new MessageEmbed()
                .setColor('#00DEFF')
                .setTitle('Queue Stopped')
                .setDescription(`<@${interaction.user.id}> has stopped the player and cleared the queue.`)
            ]
        })
    }
}

