import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { verifyAndProcessPurchase } from '../../services/economyService';
import { addBaitToTackleBox } from '../../services/fishingService';
import { formatCurrency } from '../../utils/formatters';
import { BaitType } from '../../types/Fishing';
import { ShopData } from '../../types/Shop';
import shops from '../../data/shops.json';

const buy: Command = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy items from the shop')
        .addStringOption(option =>
            option
                .setName('item_id')
                .setDescription('The ID of the item to buy')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('quantity')
                .setDescription('How many sets to buy (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const itemId = interaction.options.getString('item_id', true) as BaitType;
            const quantity = interaction.options.getInteger('quantity') || 1;

            const shopData = shops as ShopData;
            const item = shopData.fishing.items[itemId];

            if (!item) {
                await interaction.reply({
                    content: 'That item doesn\'t exist!',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const totalCost = item.price * quantity;
            const totalAmount = item.amount * quantity;

            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_purchase')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_purchase')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            // Send confirmation message
            const confirmationEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🛍️ Confirm Purchase')
                .setDescription([
                    `Are you sure you want to buy:`,
                    `${totalAmount}x ${item.emoji} ${item.name}`,
                    `Total cost: ${formatCurrency(totalCost)}`,
                    `\nThis will give you ${item.amount} ${item.name} per set.`
                ].join('\n'))
                .setFooter({ text: 'This confirmation will expire in 30 seconds' });

            const response = await interaction.reply({
                embeds: [confirmationEmbed],
                components: [row],
                flags: MessageFlags.Ephemeral
            });

            // Create collector for button interaction
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 30000,
                max: 1
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({
                        content: 'This confirmation is not for you!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                if (i.customId === 'cancel_purchase') {
                    await i.update({
                        content: 'Purchase cancelled.',
                        embeds: [],
                        components: []
                    });
                    return;
                }

                // Verify and process purchase
                const purchaseResult = await verifyAndProcessPurchase(interaction.user.id, totalCost);

                if (!purchaseResult.success) {
                    await i.update({
                        content: purchaseResult.error,
                        embeds: [],
                        components: []
                    });
                    return;
                }

                // Add items to tackle box if it's bait
                if (item.category === 'bait') {
                    const tackleResult = await addBaitToTackleBox(
                        interaction.user.id,
                        itemId as BaitType,
                        totalAmount
                    );

                    const successEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('✅ Purchase Successful!')
                        .setDescription([
                            `Bought ${totalAmount}x ${item.emoji} ${item.name}`,
                            `Total cost: ${formatCurrency(totalCost)}`,
                            `New wallet balance: ${formatCurrency(purchaseResult.newBalance!)}`,
                            `New ${item.name} amount: ${tackleResult.newAmount}`
                        ].join('\n'))
                        .setFooter({ text: 'MollyBot Shop System' })
                        .setTimestamp();

                    await i.update({
                        embeds: [successEmbed],
                        components: []
                    });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({
                        content: 'Purchase confirmation timed out.',
                        embeds: [],
                        components: []
                    });
                }
            });

        } catch (error) {
            console.error('Error in buy command:', error);
            await interaction.reply({
                content: 'There was an error processing your purchase.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default buy;
