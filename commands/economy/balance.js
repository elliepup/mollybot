const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getTieredCoins, getBalance } = require('../../extras/econFunctions')
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
        const userId = target.id;

        if(target.bot) return interaction.reply({
            content: "Please specify a real person instead of a bot.",
            ephemeral: true
        })

        var balance = await getBalance(userId)

        const embed = new MessageEmbed()
            .setTitle(`${target.username}'s balance`)
            .setColor("#20FC00")
            .setDescription(`${getTieredCoins(balance)}\n\`${balance}\` <:YukiBronze:872106572275392512> in total.`)
            .setFooter({text: `Coins currently serve no purpose. If you have any suggestions, please DM me!`})

        interaction.reply({
            embeds: [embed]
        })
    }

}