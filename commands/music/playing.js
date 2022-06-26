const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playing')
        .setDescription('Shows information about that song that is currently playing.'),
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


        const currentSong = queue.current;

        const progressBar = queue.createProgressBar(true, false, 10)
        return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#00B6FF ')
                    .setTitle("Current Song")
                    .setDescription(`[${currentSong.title}](${currentSong.url})`)
                    .addField(`Song progress`, `[${queue.getPlayerTimestamp().current}] ${progressBar} [${currentSong.duration}]`)
                    .setFooter({text: `Requested by ${currentSong.requestedBy.username}`, iconURL: currentSong.requestedBy.displayAvatarURL({dynamic: true})})
            ]
        })
    }
}

