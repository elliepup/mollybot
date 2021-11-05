module.exports = {
	name: 'prefix',
	description: 'Changes the prefix',
    args: true,
    usage: 'prefix [new prefix]',
	async execute(message, args) {
            const { prefixes } = require('../../src/index')
            const Discord = require('discord.js')
            if (args[0].length > 5) return message.reply("<@478643154854084618> has limited prefix length to five characters to prevent trolling.")
            await prefixes.set(message.guild.id, args[0]);
            const embed = new Discord.MessageEmbed()
            .setColor('51FC00')
            .setTitle("Prefix successfully changed!")
            .setDescription(`The prefix has successfully been changed to **${args[0]}**.`)
            message.channel.send(embed)
	},
};