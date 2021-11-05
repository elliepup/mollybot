module.exports = {
	name: 'queue',
	description: 'Displays songs that are in the queue.',
    aliases: ['q'],
    args: false,
	execute(message, args) {
            const { queue } = require('../../src/index')
            const Discord = require('discord.js')
            const paginationEmbed = require('discord.js-pagination')

            const voiceChannel = message.member.voice.channel;
            const serverQueue = queue.get(message.guild.id)

            if(!serverQueue) return message.reply("there currently are no songs in the queue.")
            
            const color = '#03fc84'
            const pages = [];
            const emoji = ['⬅','➡']
            const timeout = '60000';
            const MAX_ITEMS_PER_PAGE = 7;
            const chunks = sliceIntoChunks(serverQueue.songs, MAX_ITEMS_PER_PAGE);

            for(let i = 0; i < Math.ceil(serverQueue.songs.length/MAX_ITEMS_PER_PAGE); i++) {
                const embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle('🎶Songs in the queue🎶')
                .addField(`Total songs: ${serverQueue.songs.length}`, chunks[i].map((k, index) => `**#${i*MAX_ITEMS_PER_PAGE + index + 1}:** [${k.title.length < 40 ? k.title : k.title.substring(0,39) + "..."}](${k.url}) **[${toHHMMSS(k.length)}]**`), true) 
                pages.push(embed);
            }

            paginationEmbed(message, pages, emoji, timeout);

	},
};


const toHHMMSS = (time) => {
    var sec_num = parseInt(time, 10); 
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}


function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}