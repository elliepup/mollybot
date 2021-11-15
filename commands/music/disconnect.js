module.exports = {
	name: 'disconnect',
	description: 'Disconnects from the voice channel.',
    aliases: ['d','leave'],
	async execute(message, args) {
        const { queue } = require('../../src/index')
        const serverQueue = queue.get(message.guild.id);

        //clears the queue if a voice channel exists
        if(serverQueue) {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        }

        //if not in a voice channel
        if(!message.guild.me.voice.channel) { 
            return message.reply("I am not currently in a voice channel.")
        }
        
        //leaves voice channel
        await message.guild.me.voice.channel.leave();
        
        
            
	},
};