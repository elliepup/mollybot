const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const Users = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription(`Stops playing music.`),
    async execute(interaction) {
        const { player } = require('../../src/index')
        const queue = player.getQueue(interaction.guildId);

        if(!queue?.playing) return interaction.reply({
            content: "There currently are no songs in queue.",
            ephemeral: true,
        });

        const userData = await Users.findOne({userId: interaction.user.id}) || await Users.create({userId: interaction.user.id});
        await Users.findOneAndUpdate({userId: userData.userId}, {$inc: {queuesStopped: 1}})

        queue.stop();
        interaction.reply({ 
            content: 'Music has been stopped.',
        })
        
    }
}