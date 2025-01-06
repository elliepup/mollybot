import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { claimDailyReward } from '../../services/economyService';
import { getOrCreateProfile } from '../../utils/profileHandler';
import { formatCurrency } from '../../utils/formatters';

const daily: Command = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward (Available every 24 hours)') as SlashCommandBuilder,

    async execute(interaction) {
        try {
            await getOrCreateProfile(interaction.user.id, interaction.user.username);
            const result = await claimDailyReward(interaction.user.id);

            if (!result.success) {
                const hours = Math.floor(result.cooldownRemaining! / 3600);
                const minutes = Math.floor((result.cooldownRemaining! % 3600) / 60);
                const timeLeft = hours > 0 
                    ? `${hours} hours and ${minutes} minutes` 
                    : `${minutes} minutes`;
                    
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Daily Reward')
                    .setDescription(`You need to wait ${timeLeft} before claiming your daily reward again`)
                    .setFooter({ text: 'MollyBot Economy System' });

                await interaction.reply({ 
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Daily Reward Claimed!')
                .setDescription(`You received **${formatCurrency(result.amount!)}**!${result.streak && result.streak > 1 ? `\n🔥 Streak: ${result.streak} days` : ''}`)
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in daily command:', error);
            await interaction.reply({
                content: 'There was an error processing your daily reward.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default daily;

