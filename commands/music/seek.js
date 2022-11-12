const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders')
const { Player } = require('discord-player');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a given time in the current song.')
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('The type of audio filter.')
                .setRequired(true)),
    async execute(interaction) {
        const client = require('../../src/index')
        const queue = client.player.getQueue(interaction.guild);

        if (!queue) return interaction.reply({
            content: "I am not currently connected to a voice channel.",
            ephemeral: true,
        })

        interaction.reply({
            content: "This command has been temporarily disabled because it was being a bit buggy and I am too lazy to fix it.",
            ephemeral: true,
        })

        return //its a bit buggy so it is temporarily disabled

        const option = interaction.options.getString('time')
        let seconds;
        if (Number.isInteger(parseInt(option)) && !option.includes(':')) {
            seconds = parseInt(option);
        } else if (option.includes(':')) {
            const values = option.split(':');
            for (let i = 0; i < values.length; i++) {
                if (!Number.isInteger(parseInt(values[i])) || values[i].length > 2) return interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setColor('#FC0000')
                            .setTitle("<:yukinon:839338263214030859> Invalid Time")
                            .setDescription("You have entered an invalid number.")
                    ]
                })
            }
            const optionHours = (values.length > 2) ? values[0] : 0;
            optionMinutes = (values.length > 1) ? values[values.length - 2] : 0;
            optionSeconds = (values.length > 0) ? values[values.length - 1] : 0;
            seconds = parseInt(optionSeconds) + parseInt(optionMinutes * 60) + parseInt(optionHours * 3600)

        } else return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FC0000')
                    .setTitle("<:yukinon:839338263214030859> Invalid Time")
                    .setDescription("You have entered an invalid number.")
            ]
        })


        queue.seek(seconds * 1000)

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#03fc84')
                    .setTitle("🎶Songs Position Changed🎶")
                    .setDescription(`The song position has been changed to \`${formatTime(seconds)}\``)

            ]
        })

    }
}

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds - (minutes * 60);

    return (minutes == 0) ? `${remainingSeconds} second(s).` : `${minutes} minute(s) and ${remainingSeconds} second(s).`
}