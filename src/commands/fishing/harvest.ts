import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { harvestFish } from '../../services/economyService';
import { getFishByCatchId } from '../../services/fishing';
import { getRarityStars } from '../../utils/rarityUtils';

const harvest: Command = {
    data: new SlashCommandBuilder()
        .setName('harvest')
        .setDescription('Harvest a fish for astral essence')
        .addStringOption(option =>
            option
                .setName('catch_id')
                .setDescription('The ID of the fish to harvest')
                .setRequired(true)
        ) as SlashCommandBuilder,
    async execute(interaction) {
        try {
            const catchId = interaction.options.getString('catch_id', true);

            // Get fish details first for the name and rarity
            const fish = await getFishByCatchId(catchId);
            if (!fish) {
                await interaction.reply({
                    content: 'Could not find a fish with that catch ID.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_harvest')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_harvest')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            // Create confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('✨ Confirm Harvest')
                .setDescription([
                    `<@${interaction.user.id}> wants to harvest:`,
                    `${getRarityStars(fish.rarity)} ${fish.name}`,
                    '',
                    `You will receive ${fish.rarity === 'common' ? '1' :
                        fish.rarity === 'uncommon' ? '3' :
                            fish.rarity === 'rare' ? '8' :
                                fish.rarity === 'epic' ? '15' :
                                    fish.rarity === 'legendary' ? '35' : '50'} astral essence`,
                    '\n⚠️ This action cannot be undone!'
                ].join('\n'))
                .setFooter({ text: 'This confirmation will expire in 30 seconds' });

            const response = await interaction.reply({
                embeds: [confirmEmbed],
                components: [row]
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
                        content: 'Only the command user can use these buttons!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                if (i.customId === 'cancel_harvest') {
                    await i.update({
                        content: 'Harvest cancelled by user.',
                        embeds: [],
                        components: []
                    });
                    return;
                }

                const result = await harvestFish(interaction.user.id, catchId);

                if (!result.success) {
                    await i.update({
                        content: result.error,
                        embeds: [],
                        components: []
                    });
                    return;
                }

                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✨ Fish Harvested!')
                    .setDescription([
                        `<@${interaction.user.id}> harvested their ${getRarityStars(fish.rarity)} ${fish.name}`,
                        `and received ${result.essenceGained} astral essence!`,
                        '',
                        `New essence balance: ${result.newEssenceBalance} ✨`
                    ].join('\n'))
                    .setFooter({ text: 'MollyBot Fishing System' })
                    .setTimestamp();

                await i.update({ embeds: [successEmbed], components: [] });
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({
                        content: 'Harvest confirmation timed out.',
                        embeds: [],
                        components: []
                    });
                }
            });

        } catch (error) {
            console.error('Error in harvest command:', error);
            await interaction.reply({
                content: 'There was an error harvesting your fish.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default harvest;