module.exports = {
	name: 'help',
	description: 'Displays "about" information',
    aliases: ['cmd','cmds'],
    args: false,
	execute(message, args) {

            const Discord = require('discord.js')
            const embed = new Discord.MessageEmbed()
            .setTitle("🎶Molly Bot🎶")
            .setDescription("> Molly Bot is current in the early stages of development. DM bugs/suggestions to **pseudolegendary nick#0021.**")
            .addField("Music", "```diff\nplay [name/or YouTube link of song]\nskip\nstop\nvolume [1-100]\nqueue\ndisconnect/leave\nremove [#in queue]```")
            .addField("Misc.", "```diff\nprefix [new prefix]\nsuggest [suggestion]```")
            .setColor('DB00FC')
            .setFooter(`More commands coming soon.`)
            return message.channel.send(embed);
	},
};