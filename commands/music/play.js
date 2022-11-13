const { SlashCommandBuilder, EmbedBuilder, blockQuote, bold } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music given a YouTube title or link. Supports playlists!')
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

        //if the user is not in a voice channel
        if (!interaction.member.voice.channel) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Active Voice Channel")
                    .setDescription("You are not currently in a voice channel.")
            ]
        })

        //creates queue for specific guild
        const queue = interaction.client.player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            },
            leaveOnEnd: false,
            leaveOnStop: false,
            leaveOnEmpty: false,
            autoSelfDeaf: false
        });
        //tries to connect to voice channel
        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch {
            //if unable to join then delete the queue and inform user
            queue.destroy();
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> Invalid Permissions")
                        .setDescription("I do not have sufficient permissions to join that voice channel.")
                ]
            })
        }

        //if user is using the "link" subcommand
        if (interaction.options.getSubcommand() == 'link') {
            const url = interaction.options.getString('url');

            const result = await interaction.client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            //if no results
            if (!result.tracks.length) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No Results")
                        .setDescription("The search came up empty. Please verify that you have entered the correct information.")
                        .setFooter({ text: `Search term: ${url}` })
                ]
            })

            //add song to queue and reply to interaction
            const song = result.tracks[0];
            await queue.addTrack(song);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🎶New Song Added to the Queue🎶`)
                        .setDescription(`[${song.title}](${song.url}) ${bold('[' + song.duration + ']')}`)
                        .setThumbnail(song.thumbnail)
                        .setColor('#00B6FF ')
                        .setFooter({ text: `Requested by ${song.requestedBy.username}`, iconURL: song.requestedBy.displayAvatarURL({ dynamic: true }) })
                ]
            })

        }

        //if user is using the playlist subcommand
        else if (interaction.options.getSubcommand() == 'playlist') {
            const url = interaction.options.getString('url');

            const result = await interaction.client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            const playlist = result.playlist;
            queue.addTracks(result.tracks)

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🎶New Playlist Added to the Queue🎶`)
                        .setDescription(`[${playlist.title}](${playlist.url}) ${bold(`[${result.tracks.length} Songs]`)}`)
                        .setColor('#00B6FF ')
                        .setThumbnail(playlist.tracks[0].thumbnail)
                        .setFooter({ text: `Requested by ${result.tracks[0].requestedBy.username}`, iconURL: result.tracks[0].requestedBy.displayAvatarURL({ dynamic: true }) })
                ]
            })

        }

        //if user is using the search subcommand
        else if (interaction.options.getSubcommand() == 'search') {
            const query = interaction.options.getString('title');

            const result = await interaction.client.player.search(query, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            //if no results
            if (!result.tracks.length) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No Results")
                        .setDescription("The search came up empty. Please verify that you have entered the correct information.")
                ]
            })

            //add song to queue and reply to interaction
            const song = result.tracks[0]
            await queue.addTrack(song)

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🎶New Song Added to the Queue🎶`)
                        .setDescription(`[${song.title}](${song.url}) ${bold('[' + song.duration + ']')}`)
                        .setColor('#00B6FF ')
                        .setThumbnail(song.thumbnail)
                        .setFooter({ text: `Requested by ${result.tracks[0].requestedBy.username}`, iconURL: result.tracks[0].requestedBy.displayAvatarURL({ dynamic: true }) })
                ]
            })
        }

        //if (!queue.playing) await queue.play();
    }
}