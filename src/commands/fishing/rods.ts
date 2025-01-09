import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getUserRodCollection } from '../../services/fishing/rodService';
import { createPagination } from '../../utils/paginationHandler';
import { getRarityStars, getRarityColor } from '../../utils/rarityUtils';

type SortField = 'acquired_at' | 'rarity' | 'total_catches';
type SortOrder = 'asc' | 'desc';

const rods: Command = {
    data: new SlashCommandBuilder()
        .setName('rods')
        .setDescription('View your fishing rod collection')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User whose rods to view')
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName('sort')
                .setDescription('Sort rods by attribute')
                .setRequired(false)
                .addChoices(
                    { name: '📅 Date Acquired', value: 'acquired_at' },
                    { name: '✨ Rarity', value: 'rarity' },
                    { name: '📊 Total Catches', value: 'total_catches' }
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
            const sortBy = (interaction.options.getString('sort') || 'acquired_at') as SortField;
            const order = (interaction.options.getString('order') || 'desc') as SortOrder;

            let collection = await getUserRodCollection(targetUser.id);

            if (!collection.length) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ No Rods Found')
                    .setDescription(targetUser.id === interaction.user.id 
                        ? "You don't have any fishing rods yet! Use `/pull` to get some!"
                        : "This user doesn't have any fishing rods yet!")
                    .setFooter({ text: 'MollyBot Fishing System' });

                await interaction.reply({ embeds: [embed] });
                return;
            }

            // Sort rod collection
            collection.sort((a, b) => {
                if (sortBy === 'rarity') {
                    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'];
                    const compareA = rarityOrder.indexOf(a.info.rarity);
                    const compareB = rarityOrder.indexOf(b.info.rarity);
                    return order === 'asc' ? compareA - compareB : compareB - compareA;
                }
                
                const compareA = a[sortBy];
                const compareB = b[sortBy];
                return order === 'asc' ? 
                    (compareA > compareB ? 1 : -1) : 
                    (compareA < compareB ? 1 : -1);
            });

            // Split collection into chunks of 5 for pagination (rods take more space)
            const chunks = Array.from({ length: Math.ceil(collection.length / 5) }, (_, i) =>
                collection.slice(i * 5, (i + 1) * 5)
            );

            const pages = chunks.map((chunk, pageIndex) => 
                new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`🎣 ${targetUser.username}'s Rod Collection`)
                    .setDescription(chunk.map(rod => ([
                        `\`${rod.rod_id}\` · \`${getRarityStars(rod.info.rarity)}\` · ${rod.info.name}`,
                        `┗ Stats: \`${rod.info.perks.hook_speed}x\`🎯 \`${rod.info.perks.bite_window}x\`⏱️ \`${rod.info.perks.luck}x\`🍀`,
                        `┗ Catches: \`${rod.total_catches}\` (${rod.common_catches}/${rod.uncommon_catches}/${rod.rare_catches}/${rod.epic_catches}/${rod.legendary_catches}/${rod.mythical_catches})`
                    ]).join('\n')).join('\n\n'))
                    .setFooter({ 
                        text: `Page ${pageIndex + 1}/${chunks.length} • Total Rods: ${collection.length} • Sorted by: ${sortBy} (${order})`
                    })
            );

            await createPagination(interaction, {
                pages,
                timeout: 300000,
                prevLabel: 'Previous Page',
                nextLabel: 'Next Page'
            });

        } catch (error) {
            console.error('Error in rods command:', error);
            await interaction.reply({
                content: 'There was an error fetching the rod collection.',
                ephemeral: true
            });
        }
    }
};

export default rods;