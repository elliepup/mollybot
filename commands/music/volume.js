const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const { MessageEmbed } = require('discord.js');
const playdl = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Plays music given a YouTube title or link.')
        .addIntegerOption(option =>
            option.setName('volume')
                .setDescription('A number 1-100 for the volume setting.')
                .setRequired(true)),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId)
        
        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        const query = interaction.options.getInteger("volume");

        if(query > 100 || query < 1) return interaction.reply({
            content: 'Please enter a value from 1-100.',
            ephemeral: true,
        })
        
        queue.setVolume(query)

        interaction.reply({ 
            content: "Volume has been adjusted.",
            ephemeral: true,
        })
    }
    
}