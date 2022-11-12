const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const FishingData = require('../../models/FishingProfile')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Displays the inventory of the target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose inventory you want to see.')
                .setRequired(false)),
    async execute(interaction) {

        //const target = interaction.options.getUser('target') || interaction.user;
        //await FishingData.findOne({ userId: target.id }) || await FishingData.create({ userId: target.id })

        interaction.reply({
            embeds:[
                new MessageEmbed()
                .setTitle("Not yet implemented")
                .setDescription("Fishing commands are currently in development. If you have any suggestions, please send them to pseudolegendary nick#0021.")
            ]
        })
    }

}
