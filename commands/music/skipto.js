const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')

const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skips to a certain song in the queue, removing all songs that come before it from queue.')
        .addIntegerOption(option => 
            option.setName('index')
            .setDescription('The number of the song in the queue.')
            .setRequired(true)),
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

        let query = interaction.options.getInteger("index");
        
        if(query == 1) return interaction.reply({
            content: "You cannot jump to the song that is currently playing.",
            ephemeral: true
        })

        if((query < 1) || (query > queue.tracks.length + 1)) return interaction.reply({
            content: 'You cannot jump to songs that are out of the bounds of the queue.',
            ephemeral: true
        })

        const intendedTrack = queue.tracks[query - 2];
        queue.skipTo(query - 2)
        //const track = await queue.remove(query - 2);
        interaction.reply({
            embeds: [new MessageEmbed()
                .setColor('#00DEFF')
                .setTitle('Jumped to Song')
                .setDescription(`<@${interaction.user.id}> has skipped to [${intendedTrack.title}](${intendedTrack.url}).`)
            ]
        })
    }
}

