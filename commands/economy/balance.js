const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { Users, getTieredCoins } = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Displays the balance of the target.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see.')
                .setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser("target") || interaction.user;

        const userData = await Users.findOne({userId: target.id}) || await Users.create({userId: target.id});

        const balance = await userData.balance;
        const embed = new MessageEmbed()
        .setTitle(`${target.username}'s balance`)
        .setColor("#20FC00")
        .setDescription(`${getTieredCoins(balance)}\n\`${balance}\` <:YukiBronze:872106572275392512> in total.`)
        .setFooter(`Coins current serve no purpose. This was mainly added to test a new database I've been experimenting with.`)
        
        interaction.reply({ embeds: [embed] })

    }

}

