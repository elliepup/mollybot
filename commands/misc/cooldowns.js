const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData, getTieredCoins } = require('../../models/EconProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldowns')
        .setDescription('Displays the remaining time for cooldowns.'),
    async execute(interaction) {

        interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#3DBDFF')
                .setTitle(`${interaction.user.username}'s cooldowns`)
                .setDescription(`I'll work on this later :)`)
            ]
        })
    }

}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}