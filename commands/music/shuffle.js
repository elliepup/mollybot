const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const { MessageEmbed } = require('discord.js');
const playdl = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the songs in queue.'),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId)
        
        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        queue.shuffle();

        interaction.reply({ 
            content: "The queue has been shuffled.",
            ephemeral: true,
        })
    }
    
}