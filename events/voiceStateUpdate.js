module.exports = {
	name: 'voiceStateUpdate',
	async execute(...args) {
        const { client, queue } = require('../src/index')

        //return if not the bot
        if(!(client.user.id == args[0].id)) return

        const oldState = args[0]
        const newState = args[1]
        const serverQueue = queue.get(args[0].guild.id)
        
        //return if the bot is connected/connecting to a voice channel
        if(newState.channelID) return 
        
        //if the bot had previously been connected to a voice channel and is no longer connected to one
        if(oldState && serverQueue) {
                queue.delete(args[0].guild.id)
        }

        }
};