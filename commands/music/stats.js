const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Users = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Displays the music related stats of a target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose stats you want to see.')
                .setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser("target") || interaction.user;
        const userData = await Users.findOne({userId: target.id}) || await Users.create({userId: target.id});

        const embed = new MessageEmbed()
        .setColor('C54EFF')
        .setTitle(`🎶${target.username}'s global stats🎶`)
        .setDescription(`Most recent song played: ${bold(userData.mostRecentPlay)}`)
        .addField(`Lifetime stats: `, `**Songs played**: \`${userData.songsPlayed.toString()}\`\n**Songs skipped**: \`${userData.songsSkipped.toString()}\`
        **Songs removed from queue**: \`${userData.songsRemoved.toString()}\`\n**Queues stopped**: \`${userData.songsRemoved.toString()}\`
        **Times paused**: \`${userData.timesPaused}\`\n**Times resumed**: \`${userData.timesResumed}\``)
        .setFooter(`Leaderboard coming soon (maybe??)`, target.displayAvatarURL({dynamic: true}))

        interaction.reply({embeds: [embed]})
    }

}