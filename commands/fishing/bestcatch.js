const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { GuildData } = require('../../models/GuildData');
const { FishData, rarityInfo } = require('../../models/Fish');
const { User } = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestcatch')
        .setDescription('Displays the best catch for the day and best catch of all time.'),
    async execute(interaction) {
        guildData = await GuildData.findOne({ guildId: interaction.guild.id });
        if(!guildData) return interaction.reply({
            embeds: [
                new MessageEmbed()
                .setColor('#FC0000')
                .setTitle(`${interaction.guild.name}'s Fishing Statistics`)
                .setDescription("No fishing statistics have been set up yet for this server yet. " +
                "Use the fishing commands to set up fishing statistics for this server.")
            ]
        })

        const bestCatch = guildData.bestCatch[0];
        const bestCatchToday = guildData.bestCatchToday[0];
        const embed = new MessageEmbed()
            .setColor('#03fc84')
            .setTitle(`${interaction.guild.name}'s Fishing Statistics`)
            .addField("Best Catch of All Time", (bestCatch) ? `<@${bestCatch.userId}>\n\`${bestCatch.fishId}\` · \`${rarityInfo.find(obj => obj.rarity === bestCatch.rarity).stars}\` · ` +
            `\`${((bestCatch.length > 24) ? (bestCatch.length/12).toFixed(1) + " ft      " : bestCatch.length + " in    ").substring(0,8)}\` · ` +
            `\`${((bestCatch.weight > 4000) ? (bestCatch.weight/2000).toFixed(1) + " tons" : bestCatch.weight + " lb     ").substring(0,9)}\` ` +
            `· \`${(bestCatch.value)}\` <:YukiBronze:872106572275392512> · **${bestCatch.name}**${(bestCatch.shiny) ? ` ★` : ""}`  : `\`N/A\``, false)
            .addField("Best Catch Today", (bestCatchToday) ? `<@${bestCatchToday.userId}>\n\`${bestCatchToday.fishId}\` · \`${rarityInfo.find(obj => obj.rarity === bestCatchToday.rarity).stars}\` · ` +
            `\`${((bestCatchToday.length > 24) ? (bestCatchToday.length/12).toFixed(1) + " ft      " : bestCatchToday.length + " in    ").substring(0,8)}\` · ` +
            `\`${((bestCatchToday.weight > 4000) ? (bestCatchToday.weight/2000).toFixed(1) + " tons" : bestCatchToday.weight + " lb     ").substring(0,9)}\` ` +
            `· \`${(bestCatchToday.value)}\` <:YukiBronze:872106572275392512> · **${bestCatchToday.name}**${(bestCatchToday.shiny) ? ` ★` : ""}`  : `\`N/A\``, false)
            .setFooter({text: 'More information will be displayed soon.'});
            return interaction.reply({embeds: [embed]})
        }

}