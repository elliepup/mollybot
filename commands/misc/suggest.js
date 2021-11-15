module.exports = {
	name: 'suggest',
	description: 'Sends a suggestion to developer\'s discord server.',
    args: true,
    usage: 'suggest [suggestion]',
	async execute(message, args) {
        
        const suggestion = args.join(' ');
        const { client } = require('../../src/index')
        const Discord = require('discord.js')
        const suggestionChannel = client.channels.cache.get('907738987689574480')
        const embed = new Discord.MessageEmbed()
        .setColor('#D1D1D1')
        .setTitle('Suggestion confirmation')
        .setDescription(`Are you sure you'd like to submit the follow: \n${suggestion.length<100 ? suggestion : suggestion.substring(0,99) + "..."}`)

        message.channel.send(embed).then(sentEmbed => {
            sentEmbed.react('❌')
            sentEmbed.react('✅')

            const filter = (reaction, user) => {
                return ['❌', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
            }
    
            sentEmbed.awaitReactions(filter, {max: 1, time: 60000, errors: ['time']})
            .then(async collected => {
                const reaction = collected.first();
    
                if(reaction.emoji.name === '✅') {

                    const editEmbed = new Discord.MessageEmbed()
                    .setColor('#4bf542')
                    .setTitle('Suggestion sent!')
                    .setDescription(`Your suggestion has successfully been sent to the developer.`)
                    sentEmbed.edit(editEmbed);

                    const suggestionEmbed = new Discord.MessageEmbed()
                    .setColor('00DEFF')
                    .setTitle("New suggestion")
                    .setDescription(suggestion)
                    .setFooter(`Suggested by ${message.author.username}`,message.author.displayAvatarURL({ dynamic: true }))

                    suggestionChannel.send(suggestionEmbed)

                } else {
                    const editEmbed = new Discord.MessageEmbed()
                    .setColor('#b30000')
                    .setTitle('Suggestion not sent.')
                    .setDescription(`You have decided to not send a suggestion to the developer.`)
                    sentEmbed.edit(editEmbed);
                }
            })
        })
        
        .catch(collected => {
            //idk
        })

	},
};