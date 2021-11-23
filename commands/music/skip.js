const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const Users = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription(`Skips the song at the top of the queue.`),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId);

        if(!queue?.playing) return interaction.reply({
            content: "There currently are no songs in queue.",
            ephemeral: true,
        });

        interaction.reply({
            content: "Song skipped!"
        })

        const userData = await Users.findOne({userId: interaction.user.id}) || await Users.create({userId: interaction.user.id});
        await Users.findOneAndUpdate({userId: userData.userId}, {$inc: {songsSkipped: 1}})
        queue.skip();
    }
}