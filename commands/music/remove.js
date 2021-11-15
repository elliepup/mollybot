module.exports = {
	name: 'remove',
    cooldown: 3,
	description: 'Skips the next song in queue.',
    args: true,
    usage: 'remove [# in queue]',
	execute(message, args) {
            const { queue } = require('../../src/index')

            const voiceChannel = message.member.voice.channel
            const serverQueue = queue.get(message.guild.id)

            const songToSkip = Math.floor(args[0])

            if(!serverQueue) return message.reply("there currently are no songs in queue.")
            if(isNaN(songToSkip)) return message.reply("please enter a numerical value.")
            if(songToSkip == '1') return message.reply("you cannot remove the song that's currently playing. Use m!skip to skip the song that is playing.")

            if(songToSkip <= 0 || songToSkip > (serverQueue.songs.length)) return message.reply("please enter a number within the range of the queue.")
            serverQueue.songs.splice((songToSkip-1),1)
            return message.react('👍');
            
	},
};