const Users = require("../../models/Users")

module.exports = {
	name: 'skip',
	description: 'Skips the next song in queue.',
    args: false,
	async execute(message, args) {
            const { queue } = require('../../src/index')

            const voiceChannel = message.member.voice.channel;
            const serverQueue = queue.get(message.guild.id)

            //if the user isn't in a voice channel
            if(!voiceChannel) return message.reply("join a voice channel prior to attempting to skip a song.")
            //if there is no server queue
            if(!serverQueue) return message.reply("there currently are no songs in the queue.")

            //increments songs skipped by the user
            const User = await Users.findOne({userID: message.author.id});
            if(!User) {
                createUserData(message.author.id);
            } else {
                await Users.findOneAndUpdate({User}, {$inc: {songsSkipped: 1}})
            }
            await serverQueue.connection.dispatcher.end();
            message.react('👍')
	},
};


const createUserData = (userID) => {
    Users.create({userID: userID, songsSkipped: 1})
}