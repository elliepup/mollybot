const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the queue.'),
    async execute(interaction) {
        const client = require('../../src/index')
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        queue.shuffle();
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#00B6FF ')
                    .setTitle("Queue Shuffled")
                    .setDescription(`The queue has been shuffled by <@${interaction.user.id}>.`)
            ]
        })
    }
}

