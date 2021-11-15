const { queue } = require('../../src/index')
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const Discord = require('discord.js');

module.exports = {
	name: 'play',
	description: 'Plays music given parameters',
    aliases: ['p'],
    cooldown: 3,
    args: true,
    usage: 'play [name/or YouTube link of song]',
	async execute(message, args) {
            
            

            //ensures user is in a voice channel 
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel) return message.reply("join a voice channel prior to playing a song.")
            
            const serverQueue = queue.get(message.guild.id);

            //creates song object to be passed through videoPlayer method
            let song = {};

            //if found by URL
            if(ytdl.validateURL(args[0])) { 
                const songInfo = await ytdl.getInfo(args[0]);
                song = {title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, length: songInfo.videoDetails.lengthSeconds, sender: message.author}
                
            }
            //attempts to find by performing query
            else {
                const joinedArgs = args.join(" ");
                const videoQuery = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                const video = await videoQuery(args.join(' '));
                if (video) {
                    song = { title: video.title, url: video.url, thumbnail: video.thumbnail, timestamp: video.timestamp, length: video.seconds, sender: message.author };
                } 
                //if still not found
                else {
                    return message.reply('I was unable to find the video. Please ensure that you have entered the link or title properly.')
                }
            }
            
            //if the queue doesn't exist in the global queue already
            if(!serverQueue) {

                const queueConstructor = { 
                    voiceChannel: voiceChannel,
                    textChannel: message.channel,
                    connection: null,
                    songs: [],
                    currentSong: null
                }

                queue.set(message.guild.id, queueConstructor);
                queueConstructor.songs.push(song);

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    return videoPlayer(message.guild, queueConstructor.songs[0]);
                    const embed = new Discord.MessageEmbed()
                    .setTitle(`Song successfully added`)
                    .setColor('#00DEFF')
                    //.setThumbnail(song.thumbnail)
                    .setDescription(`🎶**Now playing🎶: ** [${song.title}](${song.url}) *[${song.timestamp}]*`)
                    .setFooter(`Requested by ${message.author.username}`,message.author.displayAvatarURL({ dynamic: true }))
                    return message.channel.send(embed);
                } catch(err) {
                    queue.delete(message.guild.id);
                    message.channel.send('An unexpected error has occurred connecting to the server.');
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                const embed = new Discord.MessageEmbed()
                .setTitle(`Song successfully added to the queue`)
                .setColor('#00DEFF')
                .setDescription(`[${song.title}](${song.url}) has been added to the queue.`)
                .addField("Placeholder text", "Eventually gonna display how long until the next song is played. For now you can use the **queue** command to see the songs in the queue.")
                .setFooter(`Requested by ${message.author.username}`,message.author.displayAvatarURL({ dynamic: true }))
                return message.channel.send(embed);
            }
	},
};

const videoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);
    var isWaiting = false;

    if(!song) {
        queue.delete(guild.id);
        isWaiting = true;
        setTimeout(function() {
            //if a new server queue doesn't exist after specified amount of time, disconnect from voice 
            if(!queue.get(guild.id)) songQueue.voiceChannel.leave()
            
     }, 15 * 60 *1000); //too lazy to calculate it, plus I plan on utlizing keyv to allow members to change this
    }

    if (isWaiting) return;
    const stream = ytdl(song.url, {filter: 'audioonly'});
    songQueue.currentSong =  stream;
    songQueue.connection.play(stream, {seek: 0, volume: 0.5})
    .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    })
    await songQueue.textChannel.send(new Discord.MessageEmbed()
    .setTitle('Song now playing')
    .setDescription(`🎶**Now playing🎶: ** [${song.title}](${song.url}) **[${toHHMMSS(song.length)}]**`)
    .setFooter(`Requested by ${song.sender.username}`,song.sender.displayAvatarURL({ dynamic: true }))
    .setColor('#00DEFF')
    )
}

//converts integer value into time format
const toHHMMSS = (time) => {
    var sec_num = parseInt(time, 10); 
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}
