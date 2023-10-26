const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mediacontroller')
        .setDescription('Control the media player with buttons. (WIP)'),
    async execute(interaction) {

        const mediaController = require('../../functions/mediacontroller.js');

        //do not look at the code for this function or you will want to die
        mediaController(interaction);

        return;
        if (!queue || !queue.current) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> No Songs in Queue")
                    .setDescription("There are no songs in the queue.")
            ]
        })

        
    }
}