const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks a fish to allow it to be sold or traded.')
        .addStringOption(option => option.setName('id').setDescription('The fish to unlock.').setRequired(true)),
    async execute(interaction) {

        const identifier = interaction.options.getString('id');
        const { data, error } = await interaction.client.supabase
            .rpc('get_fish_by_id', {
                fish_id_in: identifier
            })

        //if error
        if (error) {
            return interaction.reply({
                content: "An error occurred while fetching the fish.",
                ephemeral: true,
            })
        }

        //if no fish
        if (data.length == 0) {
            return interaction.reply({
                content: "No fish with that ID was found.",
                ephemeral: true,
            })
        }

        //if not owner
        if (data[0].current_owner != interaction.user.id) {
            return interaction.reply({
                content: "You can only unlock fish that you own.",
                ephemeral: true,
            })
        }

        //if already unlocked
        if (!data[0].locked) {
            return interaction.reply({
                content: "This fish is already unlocked.",
                ephemeral: true,
            })
        }

        //unlock fish

        await interaction.client.supabase
        .rpc('set_fish_locked', {
            fish_id_in: identifier,
            value_in: false
        })

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor('#03fc84')
                .setTitle('Fish Unlocked')
                .setDescription(`You have unlocked fish \`${identifier}\`.`)
                .setTimestamp()
            ]
        })

    }
};