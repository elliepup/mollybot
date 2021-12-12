const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { Users } = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription(`Pauses the song at the top of the queue.`),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId);

        if(!queue?.playing) return interaction.reply({
            content: "There currently are no songs in queue.",
            ephemeral: true,
        });

        const userData = await Users.findOne({userId: interaction.user.id}) || await Users.create({userId: interaction.user.id});
        await Users.findOneAndUpdate({userId: userData.userId}, {$inc: {timesPaused: 1}})

        queue.setPaused(true);

        interaction.reply({
            content: "Song paused!",
        })
    }
}