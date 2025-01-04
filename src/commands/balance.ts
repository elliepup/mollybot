import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';
import { getOrCreateProfile } from '../utils/profileHandler';

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

        try {
            const profile = await getOrCreateProfile(targetUser.id, targetUser.username);
            const total = profile.economy.wallet_balance + profile.economy.bank_balance;

            const embed = new EmbedBuilder()
                .setColor(targetUser.id === interaction.user.id ? '#00ff00' : '#0099ff')
                .setAuthor({
                    name: `${targetUser.username}'s Balance`,
                    iconURL: targetUser.displayAvatarURL()
                })
                .addFields(
                    { name: '💰 Wallet', value: `$${profile.economy.wallet_balance.toLocaleString()}`, inline: true },
                    { name: '🏦 Bank', value: `$${profile.economy.bank_balance.toLocaleString()}`, inline: true },
                    { name: '💵 Total', value: `$${total.toLocaleString()}`, inline: false }
                )
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            if (profile.economy.selected_job !== 'unemployed') {
                embed.addFields({
                    name: '💼 Job',
                    value: profile.economy.selected_job.charAt(0).toUpperCase() +
                        profile.economy.selected_job.slice(1),
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching profile:', error);
            await interaction.reply({
                content: 'There was an error fetching the balance.',
                ephemeral: true
            });
        }
    }
};

export default balance;