module.exports = {
	name: 'help',
	description: 'Displays "about" information',
    aliases: ['cmd','cmds'],
    args: false,
	execute(message, args) {

            const Discord = require('discord.js')
            const embed = new Discord.MessageEmbed()
            .setTitle("Molly Bot Help")
            .setDescription("Molly Bot is currently in the early stages of development and offers no useful functionality. The developer," + 
            "**pseudolegendary nick#0021** is still unsure what he even wants the bot to do.")
            
            .setColor('DB00FC')

            return message.channel.send(embed);
	},
};