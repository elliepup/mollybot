module.exports = {
	name: 'volume',
	description: 'Changes the volume',
    args: true,
    usage: 'volume [1-100]',
	execute(message, args) {
            const { queue } = require('../../src/index')

            const voiceChannel = message.member.voice.channel;
            const serverQueue = queue.get(message.guild.id)

            //if the user isn't in a voice channel
            if(!voiceChannel) return message.reply("join a voice channel prior to attempting to skip a song.")
            //if there is no server queue
            if(!serverQueue) return message.reply("there currently are no songs in the queue.")
            if(isNaN(args[0]) || args[0] > 100 || args[0] < 1) return message.reply("please enter a number from 1 to 100.")
            serverQueue.connection.dispatcher.setVolume(args[0]/100)
            message.react('👍')
	},
};