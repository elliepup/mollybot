const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { EconData, getTieredCoins } = require('../../models/EconProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays the balance of the target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see.')
                .setRequired(false)),
    async execute(interaction) {
        
        const target = interaction.options.getUser('target') || interaction.user;
        const targetEcon = await EconData.findOne({userId: target.id}) || await EconData.create({userId: target.id});
        const balance = await targetEcon.balance;

        const embed = new MessageEmbed()
        .setTitle(`${target.username}'s balance`)
        .setColor("20FC00")
        .setDescription(`${getTieredCoins(balance)}\n\`${balance}\` <:YukiBronze:872106572275392512> in total.`)
        .setFooter({text: "With coins, you can buy things from the shop.", icon_url: "https://cdn.discordapp.com/emojis/872106572275392512.png"})
        await interaction.reply({embeds : [embed]})
    }

}
