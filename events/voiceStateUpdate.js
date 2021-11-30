module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    execute(oldState, newState, ...args) {
        const { player, client } = require('../src/index');
        const serverQueue = player.getQueue(oldState.guild.id);
        //if not the bot
        if(!(client.user.id == oldState.id)) return;

        //return if the bot is connected/connecting to a voice channel
        if(newState.channelId) return;

        if(oldState.channelId && serverQueue) {
            player.deleteQueue(oldState.guild.id)
        }
    }
}