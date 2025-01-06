import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { createPagination } from '../../utils/paginationHandler';
import { formatCurrency } from '../../utils/formatters';
import { ShopType } from '../../types/Shop';
import shops from '../../data/shops.json';

const shop: Command = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Browse available shops')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of shop to browse')
                .setRequired(true)
                .addChoices(
                    { name: '🎣 Fishing Shop', value: 'fishing' }
                )
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const shopType = interaction.options.getString('type', true) as ShopType;
            const selectedShop = shops[shopType];

            if (!selectedShop) {
                await interaction.reply({
                    content: 'That shop is not available!',
                    ephemeral: true
                });
                return;
            }

            // Group items by category
            const categories = Object.entries(selectedShop.items).reduce((acc, [id, item]) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push({ id, ...item });
                return acc;
            }, {} as Record<string, any[]>);

            const pages = Object.entries(categories).map(([category, items]) => {
                return new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle(`${selectedShop.name} - ${category.charAt(0).toUpperCase() + category.slice(1)}s`)
                    .setDescription(selectedShop.description)
                    .addFields(
                        items.map(item => ({
                            name: `${item.emoji} ${item.name}`,
                            value: [
                                `Price: ${formatCurrency(item.price)}`,
                                `Amount: ${item.amount}x per purchase`,
                                `*${item.description}*`,
                                `Use \`/buy ${item.id}\` to purchase`
                            ].join('\n'),
                            inline: true
                        }))
                    )
                    .setFooter({ text: 'MollyBot Shop System' })
                    .setTimestamp();
            });

            await createPagination(interaction, {
                pages,
                timeout: 300000,
                prevLabel: 'Previous',
                nextLabel: 'Next'
            });

        } catch (error) {
            console.error('Error in shop command:', error);
            await interaction.reply({
                content: 'There was an error accessing the shop.',
                ephemeral: true
            });
        }
    }
};

export default shop;
