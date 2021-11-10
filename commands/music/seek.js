module.exports = {
	name: 'seek',
	description: 'Seek to a certain part of the song',
    args: true,
    usage: 'volume [seconds or MM:SS]',
	execute(message, args) {
		return;
		const { queue } = require('../../src/index')
		const serverQueue = queue.get(message.guild.id)
		serverQueue.connection.play(serverQueue.currentSong, {seek: 0})
	},
};