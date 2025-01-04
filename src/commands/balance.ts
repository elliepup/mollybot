import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';

const balance: Command = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Replies with balance information')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check balance for')
                .setRequired(false)
        ) as SlashCommandBuilder,
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const balanceMessage = targetUser.id === interaction.user.id
            ? 'Your balance is $0'
            : `${targetUser.username}'s balance is $0`;
            
        await interaction.reply(balanceMessage);
    }
};

export default balance;
