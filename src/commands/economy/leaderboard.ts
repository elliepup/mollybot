import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getLeaderboard, LeaderboardType } from '../../services/economyService';
import { formatCurrency } from '../../utils/formatters';
import { createPagination } from '../../utils/paginationHandler';

const leaderboard: Command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the wealthiest users')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of leaderboard to view')
                .addChoices(
                    { name: 'Total Wealth', value: 'total' },
                    { name: 'Wallet Balance', value: 'wallet' },
                    { name: 'Bank Balance', value: 'bank' }
                )
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const type = (interaction.options.getString('type') || 'total') as LeaderboardType;
            const data = await getLeaderboard(type);

            // Split data into chunks of 10 for pagination
            const chunks = Array.from({ length: Math.ceil(data.length / 10) }, (_, i) =>
                data.slice(i * 10, (i + 1) * 10)
            );

            const pages = chunks.map((chunk, pageIndex) => {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`🏆 Wealth Leaderboard - ${type.charAt(0).toUpperCase() + type.slice(1)}`)
                    .setDescription(chunk.map((entry, index) => {
                        const position = pageIndex * 10 + index + 1;
                        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '▫️';
                        const value = type === 'wallet' ? entry.wallet_balance :
                                    type === 'bank' ? entry.bank_balance :
                                    entry.total;
                        
                        return `${medal} **${position}.** <@${entry.user_id}>: ${formatCurrency(value)}`;
                    }).join('\n'))
                    .setFooter({ text: `Page ${pageIndex + 1}/${chunks.length} • MollyBot Economy System` })
                    .setTimestamp();

                return embed;
            });

            await createPagination(interaction, {
                pages,
                timeout: 300000,
                prevLabel: 'Previous',
                nextLabel: 'Next'
            });

        } catch (error) {
            console.error('Error in leaderboard command:', error);
            await interaction.reply({
                content: 'There was an error fetching the leaderboard.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default leaderboard;
