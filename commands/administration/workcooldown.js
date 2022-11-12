const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData } = require('../../models/EconProfile')
const { User, getTieredCoins } = require('../../models/User')
const { ClientInfo } = require('../../models/ClientInfo')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setworkcooldown')
        .setDescription('Change the global work cooldown. ADMIN ONLY.')
        .addNumberOption(option =>
            option.setName('seconds')
                .setDescription('The new work cooldown.')
                .setRequired(true)),
    async execute(interaction) {
        
        const clientInfo = await ClientInfo.findOne({})
        const currentWorkCooldown = clientInfo.workCooldown;
        const admins = clientInfo.admins;
        if(!admins.includes(interaction.user.id)) {
            return interaction.reply({content: "You do not have permission to use this command.", ephemeral: true})
        }

        const newWorkCooldown = interaction.options.getNumber('seconds');
        await clientInfo.updateOne({workCooldown: newWorkCooldown})
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle("Work Cooldown Changed")
                .setColor("20FC00")
                .setDescription(`The shiny rate has been changed from \`${convertSeconds(currentWorkCooldown)}\` to \`${convertSeconds(newWorkCooldown)}\``)
                .setFooter({text: "It has been changed by " + interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            ]
        })
        
    }

}

const convertSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}