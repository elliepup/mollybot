module.exports = {
    name: 'voiceStateUpdate',
    once: false,
     execute(oldState, newState, ...args) {
        const client = require('../src/index');
        const serverQueue = client.player.getQueue(oldState.guild.id);
        //if not the bot
        if(!(client.user.id == oldState.id)) return;

        //return if the bot is connected/connecting to a voice channel
        if(newState.channelId) return;

        if(oldState.channelId && serverQueue) {
            client.player.deleteQueue(oldState.guild.id)
        }
    }
}