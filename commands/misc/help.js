module.exports = {
	name: 'help',
	description: 'Displays "about" information',
    aliases: ['cmd','cmds'],
    args: false,
	execute(message, args) {

            const Discord = require('discord.js')
            const embed = new Discord.MessageEmbed()
            .setTitle("🎶Molly Bot🎶")
            .setDescription("> Molly Bot is current in the early stages of development. DM suggestions to **pseudolegendary nick#0021.**")
            .addField("Music", "```diff\n-play [name/or YouTube link of song]\n-skip\n-stop\n-volume [1-100]```")
            .setColor('DB00FC')
            .setFooter(`More commands coming soon.`)
            return message.channel.send(embed);
	},
};