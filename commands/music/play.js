const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music given a YouTube title or link.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search for a video based on the name.')
                .addStringOption(option => option.setName('title').setDescription('The keywords to search for a video.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('playlist')
                .setDescription('Plays a YouTube playlist given a link to the playlist.')
                .addStringOption(option => option.setName('url').setDescription('The link to the playlist.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Plays a YouTube video provided a link.')
                .addStringOption(option => option.setName('url').setDescription('The link of the song.').setRequired(true))),
    async execute(interaction) {

        const client = require('../../src/index')

        //if the user is not in a voice channel
        if(!interaction.member.voice.channel) return await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Active Voice Channel")
                    .setDescription("You are not currently in a voice channel.")
            ]
        })

        //creates queue and joins the voice channel of the user
        const queue = await client.player.createQueue(interaction.guild);
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);

        if(interaction.options.getSubcommand() == 'link') {
            const url = interaction.options.getString('url');

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            if(!result.tracks.length) return await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No Results")
                        .setDescription("The search came up empty. Please verify that you have entered the correct information.")
                        .setFooter({text: `Search term: ${url}`})
                ]
            })

            const song = result.tracks[0];
            await queue.addTrack(song);
            
            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle(`🎶New Song Added to the Queue🎶`)
                    .setDescription(`[${song.title}](${song.url}) ${bold('[' + song.duration + ']')}`)
                    .setColor('#00B6FF ')
                    .setFooter({text: `Requested by ${song.requestedBy.username}`, iconURL: song.requestedBy.displayAvatarURL({dynamic: true})})
                ]
            })
        } else if(interaction.options.getSubcommand() == 'playlist') {
            const url = interaction.options.getString('url');

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if(!result.tracks.length) return await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No Results")
                        .setDescription("The search came up empty. Please verify that you have entered the correct information.")
                        .setFooter({text: `Search term: ${url}`})
                ]
            })

            const playlist = result.playlist;
            await queue.addTracks(result.tracks);

            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle(`🎶New Playlist Added to the Queue🎶`)
                    .setDescription(`[${playlist.title}](${playlist.url}) ${bold(`[${result.tracks.length} Songs]`)}`)
                    .setColor('#00B6FF ')
                    .setFooter({text: `Requested by ${result.tracks[0].requestedBy.username}`, iconURL: result.tracks[0].requestedBy.displayAvatarURL({dynamic: true})})
                ]
            })
        } else if (interaction.options.getSubcommand() == 'search') {
            const url = interaction.options.getString('title');
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngien: QueryType.AUTO
            })

            if(!result.tracks.length) return await interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No Results")
                        .setDescription("The search came up empty. Please verify that you have entered the correct information.")
                ]
            })

            const song = result.tracks[0]
            await queue.addTrack(song)

            await interaction.reply({
                embeds: [
                    new MessageEmbed()
                    .setTitle(`🎶New Playlist Added to the Queue🎶`)
                    .setDescription(`[${song.title}](${song.url}) ${bold('[' + song.duration + ']')}`)
                    .setColor('#00B6FF ')
                    .setFooter({text: `Requested by ${result.tracks[0].requestedBy.username}`, iconURL: result.tracks[0].requestedBy.displayAvatarURL({dynamic: true})})
                ]
            })
        }
        
        if(!queue.playing) await queue.play();
    } 

}
