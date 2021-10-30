module.exports = {
	name: 'skip',
	description: 'Skips the next song in queue.',
    args: false,
	execute(message, args) {
            const { queue } = require('../../src/index')

            const voiceChannel = message.member.voice.channel;
            const serverQueue = queue.get(message.guild.id)

            //if the user isn't in a voice channel
            if(!voiceChannel) return message.reply("join a voice channel prior to attempting to skip a song.")
            //if there is no server queue
            if(!serverQueue) return message.reply("there currently are no songs in the queue.")
            serverQueue.connection.dispatcher.end();
            message.react('👍')
	},
};