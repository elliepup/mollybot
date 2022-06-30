const { SlashCommandBuilder, blockQuote, codeBlock } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands to the user.'),
    async execute(interaction) {
        
       interaction.reply({
        embeds: [
            new MessageEmbed()
            .setTitle("Molly Bot Commands")
            .setDescription(`${blockQuote("Molly Bot **[REVAMPED]** is current in the early stages of development. DM bugs/suggestions to **pseudolegendary nick#0021**.")}`)
            .setColor("#82E4FF")
            .addField(`Music`,codeBlock("play\nskip\npause\nresume\nqueue\ndisconnect\nremove\nshuffle\nstop\njump\njumpto\nplaying\nfilter"))
            .addField("Fishing", codeBlock("bestcatch\nbuy\ncollection\nfish\ngift\ninventory\nlock\nsell\nshop\ntrade\ntrades\nunlock\nview\nviewtrade"))
            .addField(`Economy`, codeBlock("balance\ncoinflip\ndonate\nleaderboard\nwork"))
            .setFooter({text: "As always, bugs are to be expected. Please DM exactly what happened if you encounter issues."})
            
        ]
       })
    }

}
