module.exports = {
	name: 'disconnect',
	description: 'Disconnects from the voice channel.',
    aliases: ['d','leave'],
	execute(message, args) {
        const { queue } = require('../../src/index')

        const voiceChannel = message.member.voice.channel;
        const serverQueue = queue.get(message.guild.id)

        if(serverQueue) { 
            serverQueue.songs = [];
            serverQueue.connection.dispatcher.end()
            return message.react('👍')
        }

        if(!message.guild.me.voice.channel) return message.reply("I am not even in a voice channel.")
        
        message.guild.me.voice.channel.leave()
        return message.react('👍')
        
            
	},
};