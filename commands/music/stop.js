const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const Users = require(`../../models/Users`)
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

        let userData = await Users.findOne({ userId: interaction.user.id });
        if (!userData) {
            await Users.create({ userId: target.id }).then((newData) => userData = newData)
        }

        await Users.findOneAndUpdate({userData}, {$inc: {queuesStopped: 1}})

        queue.stop();
        interaction.reply({ 
            content: 'Music has been stopped.',
        })
        
    }
}