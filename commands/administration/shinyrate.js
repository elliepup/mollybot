const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData } = require('../../models/EconProfile')
const { User, getTieredCoins } = require('../../models/User')
const { ClientInfo } = require('../../models/ClientInfo')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setshinyrate')
        .setDescription('Change the global shiny rate. ADMIN ONLY.')
        .addNumberOption(option =>
            option.setName('shinyrate')
                .setDescription('The new shiny rate.')
                .setRequired(true)),
    async execute(interaction) {
        
        const clientInfo = await ClientInfo.findOne({})
        const currentShinyRate = clientInfo.shinyRate;
        const admins = clientInfo.admins;
        if(!admins.includes(interaction.user.id)) {
            return interaction.reply({content: "You do not have permission to use this command.", ephemeral: true})
        }

        const newShinyRate = interaction.options.getNumber('shinyrate');
        await clientInfo.updateOne({shinyRate: newShinyRate})
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle("Shiny Rate Changed")
                .setColor("20FC00")
                .setDescription(`The shiny rate has been changed from \`${currentShinyRate * 100}%\` to \`${newShinyRate* 100}%\`.`)
                .setFooter({text: "It has been changed by " + interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            ]
        })
        
    }

}
