const queue = new Map();

module.exports = {
	name: 'play',
	description: 'Plays music given parameters',
    aliases: ['play', 'p'],
    args: true,
    usage: 'play [name of song]',
	async execute(message, args) {
            const ytdl = require('ytdl-core');
            const ytSearch = require('yt-search');

            //ensures user is in a voice channel 
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.reply("join a voice channel prior to playing a song.")
            
            const serverQueue = queue.get(message.guild.id);

            let song = {};

            if(ytdl.validateURL(args[0])) { 
                const songInfo = await ytdl.getInfo(args[0]);
                song = {title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url}
                return console.log(song)
            }
            else {
                const joinedArgs = args.join(" ");
                const videoQuery = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await videoQuery(args.join(' '));
                if (video) {
                    song = { title: video.title, url: video.url };
                } else {
                    message.reply('I was unable to find the video. Please ensure that you have entered the link or title properly.')
                }
            }
            
            if(!serverQueue) {

                const queueConstructor = { 
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    songs: []
                }

                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    //videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch(err) {
                    queue.delete(message.guild.id);
                    message.channel.send('An unexpected error has occurred connecting to the server.');
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(`\`${song.title}\` has been added to the queue.`)
            }
	},
};