const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData } = require('../../models/EconProfile')
const { User, getTieredCoins } = require('../../models/User')
const { ClientInfo } = require('../../models/ClientInfo')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setfishingcooldown')
        .setDescription('Change the global fishing cooldown. ADMIN ONLY.')
        .addNumberOption(option =>
            option.setName('seconds')
                .setDescription('The new fishing cooldown.')
                .setRequired(true)),
    async execute(interaction) {
        
        const clientInfo = await ClientInfo.findOne({})
        const currentFishingCooldown = clientInfo.fishingCooldown;
        const admins = clientInfo.admins;
        if(!admins.includes(interaction.user.id)) {
            return interaction.reply({content: "You do not have permission to use this command.", ephemeral: true})
        }

        const newFishingCooldown = interaction.options.getNumber('seconds');
        await clientInfo.updateOne({fishingCooldown: newFishingCooldown})
        await interaction.reply({
            embeds: [
                new MessageEmbed()
                .setTitle("Fishing Cooldown Changed")
                .setColor("20FC00")
                .setDescription(`The fishing cooldown has been changed from \`${convertSeconds(currentFishingCooldown)}\` to \`${newFishingCooldown}\``)
                .setFooter({text: "It has been changed by " + interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            ]
        })
        
    }

}

// convert seconds to hh:mm:ss
const convertSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}