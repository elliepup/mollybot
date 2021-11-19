const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search')
const { queue } = require('../../src/index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music given a YouTube title or link.')
        .addStringOption(option =>
            option.setName('video')
                .setDescription('The title or link of the YouTube video.')
                .setRequired(true)),
    async execute(interaction) {

        const arg = interaction.options._hoistedOptions[0].value

        //if the user is not in a voice channel
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: "Please join a voice channel prior to attempting to play music.", ephemeral: true });

        //if the bot does not have permissions to connect/speak
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) return interaction.reply({ content: "I do not have permissions to connect or speak in the voice channel."})

        //server queue initialization stuff
        const serverQueue = queue.get(interaction.guild.id);
        
        //song array to be passed through videoPlayer function
        let song = {};

        //if found by URL
        if (ytdl.validateURL(arg)) {
            const songInfo = await ytdl.getInfo(arg);
            song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, length: songInfo.videoDetails.lengthSeconds, sender: interaction.user.username };
        }

        //attempts to find by performing a query
        else {
            const videoQuery = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }
            const video = await videoQuery(arg);
            if (video) {
                song = { title: video.title, url: video.url, thumbnail: video.thumbnail, timestamp: video.timestamp, length: video.seconds, sender: interaction.user.username };
            }
            else {
                return interaction.reply({content: "I was unable to find the video. Please ensure that you have entered the link or title properly.", ephemeral: true})
            }
        }
        
        
        

    }

}