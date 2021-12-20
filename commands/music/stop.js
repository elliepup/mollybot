const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');

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

        queue.stop();
        interaction.reply({ 
            content: 'Music has been stopped.',
        })
        
    }
}