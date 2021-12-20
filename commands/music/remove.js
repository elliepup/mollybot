const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const { MessageEmbed } = require('discord.js');
const playdl = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a certain song from the queue.')
        .addIntegerOption(option =>
            option.setName('index')
                .setDescription('The queue number of the song.')
                .setRequired(true)),
    async execute(interaction) {
        const { player } = require('../../src/index')
        let queue = player.getQueue(interaction.guildId)
        
        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        
        let query = interaction.options.getInteger("index");

        if(query == 1) return interaction.reply({
            content: "You cannot remove the song that is currently playing. Use /skip instead.",
            ephemeral: true
        })

        if((query < 1) || (query > queue.tracks.length + 1)) return interaction.reply({
            content: 'You cannot remove songs that are out of the bounds of the queue.',
            ephemeral: true
        })

        const track = await queue.remove(query - 2);
        interaction.reply({
            embeds: [new MessageEmbed()
                .setColor('#00DEFF')
                .setTitle('🎶Song removed from queue🎶')
                .setDescription(`${bold(track.title)} has been removed from the queue.`)
            ]
        })
        
    }
    
}