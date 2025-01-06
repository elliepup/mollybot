import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getUserFishCollection } from '../../services/fishingService';
import { createPagination } from '../../utils/paginationHandler';
import { getRarityStars } from '../../utils/rarityUtils';
import { formatCurrency } from '../../utils/formatters';

type SortField = 'caught_at' | 'value' | 'length' | 'weight' | 'rarity';
type SortOrder = 'asc' | 'desc';

const collection: Command = {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('View your fish collection')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User whose collection to view')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('sort')
                .setDescription('Sort fish by attribute')
                .setRequired(false)
                .addChoices(
                    { name: '📅 Date Caught', value: 'caught_at' },
                    { name: '💰 Value', value: 'value' },
                    { name: '📏 Length', value: 'length' },
                    { name: '⚖️ Weight', value: 'weight' },
                    { name: '✨ Rarity', value: 'rarity' }
                )
        )
        .addStringOption(option =>
            option
                .setName('order')
                .setDescription('Sort order')
                .setRequired(false)
                .addChoices(
                    { name: '⬆️ Ascending', value: 'asc' },
                    { name: '⬇️ Descending', value: 'desc' }
                )
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const sortBy = (interaction.options.getString('sort') || 'caught_at') as SortField;
            const order = (interaction.options.getString('order') || 'desc') as SortOrder;

            let collection = await getUserFishCollection(targetUser.id);

            if (!collection.length) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ No Fish Found')
                    .setDescription(targetUser.id === interaction.user.id 
                        ? "You haven't caught any fish yet! Use `/fish` to start fishing!"
                        : "This user hasn't caught any fish yet!")
                    .setFooter({ text: 'MollyBot Fishing System' });

                await interaction.reply({ embeds: [embed] });
                return;
            }

            // Sort collection
            collection.sort((a, b) => {
                let compareA = a[sortBy];
                let compareB = b[sortBy];

                // Special handling for rarity
                if (sortBy === 'rarity') {
                    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
                    compareA = rarityOrder.indexOf(a.rarity);
                    compareB = rarityOrder.indexOf(b.rarity);
                }

                if (order === 'asc') {
                    return compareA > compareB ? 1 : -1;
                } else {
                    return compareA < compareB ? 1 : -1;
                }
            });

            // Split collection into chunks of 10 for pagination
            const chunks = Array.from({ length: Math.ceil(collection.length / 10) }, (_, i) =>
                collection.slice(i * 10, (i + 1) * 10)
            );

            const pages = chunks.map((chunk, pageIndex) => {
                const totalWorth = collection.reduce((sum, fish) => sum + fish.value, 0);
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`🎣 ${targetUser.username}'s Fish Collection`)
                    .setDescription(chunk.map(fish => {
                        // Pad numbers to ensure uniform width
                        const length = fish.length.toFixed(1).padStart(5, ' ');
                        const weight = fish.weight.toFixed(1).padStart(5, ' ');
                        const value = formatCurrency(fish.value).padStart(8, ' ');
                        
                        return `\`${fish.catch_id}\` · \`${getRarityStars(fish.rarity)}\` · \`${length}"\` · \`${weight}lb\` · \`${value}\` · ${fish.name}`;
                    }).join('\n'))
                    .setFooter({ 
                        text: `Page ${pageIndex + 1}/${chunks.length} • Total Catches: ${collection.length} • Total Worth: ${formatCurrency(totalWorth)} • Sorted by: ${sortBy} (${order}) • MollyBot Fishing System`
                    });

                return embed;
            });

            await createPagination(interaction, {
                pages,
                timeout: 300000,
                prevLabel: 'Previous',
                nextLabel: 'Next'
            });

        } catch (error) {
            console.error('Error in collection command:', error);
            await interaction.reply({
                content: 'There was an error fetching the fish collection.',
                ephemeral: true
            });
        }
    }
};

export default collection;
