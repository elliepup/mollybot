module.exports = {
	name: 'help',
	description: 'Displays "about" information',
    aliases: ['cmd','cmds'],
    args: false,
	execute(message, args) {

            const Discord = require('discord.js')
            const embed = new Discord.MessageEmbed()
            .setTitle("Molly Bot Help")
            .setDescription("Molly Bot is currently in the early stages of development and offers no useful functionality. Molly Bot " + 
            "is intended to be used as a music bot and the developer is in the process of programming this.")
            .setColor('DB00FC')
            return message.channel.send(embed);
	},
};