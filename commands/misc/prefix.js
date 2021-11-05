module.exports = {
	name: 'prefix',
	description: 'Changes the prefix',
    args: true,
    usage: 'prefix [new prefix]',
	async execute(message, args) {
            const { prefixes } = require('../../src/index')
            console.log(prefixes)
            if (args[0].length > 5) return message.reply("<@478643154854084618> has limited prefix length to five characters to prevent trolling.")
            await prefixes.set(message.guild.id, args[0]);
            return message.channel.send(`Successfully set prefix to \`${args[0]}\``);
	},
};