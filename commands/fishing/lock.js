const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks a fish to prevent it from being sold or traded.')
        .addStringOption(option => option.setName('id').setDescription('The fish to lock.').setRequired(true)),
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
                content: "You can only lock fish that you own.",
                ephemeral: true,
            })
        }

        //if already locked
        if (data[0].locked) {
            return interaction.reply({
                content: "This fish is already locked.",
                ephemeral: true,
            })
        }

        //lock fish

        await interaction.client.supabase
        .rpc('set_fish_locked', {
            fish_id_in: identifier,
            value_in: true
        })

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor('#03fc84')
                .setTitle("Locked Fish")
                .setDescription(blockQuote("You have successfully locked the fish with the ID of \`" + identifier + "`. This fish can no longer be sold or traded until you unlock it."))
                .addFields({name: "Fish ID", value: codeBlock(data[0].fish_id_out), inline: true}, {name: "Fish", value: codeBlock(data[0].name), inline: true},
                {name: "Shiny", value: codeBlock(data[0].shiny), inline: true}, {name: "Value", value: (getTieredCoins(data[0].value)), inline: false})
            ]
        })

    }
}