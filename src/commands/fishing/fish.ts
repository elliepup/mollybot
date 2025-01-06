import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { verifyBait, getRandomFish, generateFishStats } from '../../services/fishingService';
import { getOrCreateProfile } from '../../utils/profileHandler';
import { formatCurrency } from '../../utils/formatters';
import { getRarityColor, getRarityStars } from '../../utils/rarityUtils';

const BITE_WINDOW_MS = 1000; // 1 second window to catch fish
const EARLY_HOOK_COOLDOWN_MS = 2000; // 2 second cooldown for early hooks

const fish: Command = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Go fishing! Requires bait.'),

    async execute(interaction) {
        try {
            // Create or get all profiles
            await getOrCreateProfile(interaction.user.id, interaction.user.username);
            
            // Verify bait
            const baitCheck = await verifyBait(interaction.user.id);

            if (!baitCheck.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Fishing Failed')
                    .setDescription(baitCheck.error!)
                    .setFooter({ text: 'MollyBot Fishing System' });

                await interaction.reply({
                    embeds: [embed],
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Create buttons
            const fishButton = new ButtonBuilder()
                .setCustomId('confirm_fish')
                .setLabel('🎣 Cast Line')
                .setStyle(ButtonStyle.Primary);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_fish')
                .setLabel('❌ Leave')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(fishButton, cancelButton);

            // Create initial embed
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎣 Gone Fishin\'')
                .setDescription([
                    `You've arrived at a peaceful fishing spot. The water looks promising!`,
                    '',
                    `**Current Bait:** ${baitCheck.currentBait}`,
                    `**Amount Left:** ${baitCheck.baitCount} pieces`,
                    '',
                    'Would you like to cast your line? Don\'t forget to hook the fish when it bites! Be sure not to pull too early!',
                ].join('\n'))
                .setFooter({ text: 'This prompt will expire in 30 seconds • MollyBot Fishing System' });

            const response = await interaction.reply({
                embeds: [embed],
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
                        content: 'This fishing spot is taken!',
                        ephemeral: true
                    });
                    return;
                }

                if (i.customId === 'cancel_fish') {
                    await i.update({
                        embeds: [embed.setColor('#808080').setDescription('You decided to leave the fishing spot.')],
                        components: []
                    });
                    return;
                }

                // Start fishing minigame
                if (i.customId === 'confirm_fish') {
                    // Create hook button
                    const hookButton = new ButtonBuilder()
                        .setCustomId('hook_fish')
                        .setLabel('⚓ Hook!')
                        .setStyle(ButtonStyle.Danger);

                    const hookRow = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(hookButton);

                    // Initial cast message with hook button
                    await i.update({
                        embeds: [embed.setColor('#808080').setDescription('🎣 Line cast... Waiting for a bite...')],
                        components: [hookRow]
                    });

                    let fishBiting = false;
                    let canHook = true;
                    const biteTime = Math.floor(Math.random() * 5000) + 5000;

                    // Create collector for hook attempts
                    const hookCollector = response.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: biteTime + BITE_WINDOW_MS + 1000 // Total time: bite time + window + buffer
                    });

                    // Handle hook attempts
                    hookCollector.on('collect', async (hookInteraction) => {
                        if (hookInteraction.user.id !== interaction.user.id) {
                            await hookInteraction.reply({
                                content: 'This isn\'t your fishing line!',
                                ephemeral: true
                            });
                            return;
                        }

                        if (!canHook) {
                            await hookInteraction.deferUpdate();
                            return;
                        }

                        if (!fishBiting) {
                            // Early hook penalty
                            canHook = false;
                            await hookInteraction.update({
                                embeds: [embed
                                    .setColor('#ff0000')
                                    .setDescription('You pulled too early and scared the fish! Wait for a bite...')
                                ],
                                components: [hookRow]
                            });

                            // Reset after cooldown
                            setTimeout(() => {
                                canHook = true;
                            }, EARLY_HOOK_COOLDOWN_MS);

                            return;
                        }

                        // Successful hook during bite window
                        hookCollector.stop('success');
                        
                        // Ensure bait type exists before getting fish
                        if (!baitCheck.currentBait) {
                            await hookInteraction.update({
                                embeds: [embed
                                    .setColor('#ff9900')
                                    .setDescription('Something went wrong with your bait!')
                                ],
                                components: []
                            });
                            return;
                        }
                        
                        // Get random fish based on bait type
                        const caughtFish = getRandomFish(baitCheck.currentBait);
                        
                        if (!caughtFish) {
                            await hookInteraction.update({
                                embeds: [embed
                                    .setColor('#ff9900')
                                    .setDescription('You caught... nothing? Maybe try different bait!')
                                ],
                                components: []
                            });
                            return;
                        }

                        const stats = await generateFishStats(caughtFish, interaction.user.id);
                        
                        const catchEmbed = new EmbedBuilder()
                            .setColor(getRarityColor(caughtFish.rarity))
                            .setTitle(`Success! You caught a ${caughtFish.name}!`)
                            .setDescription(stats.catchPhrase)
                            .addFields(
                                { name: '🎫 Catch ID', value: `\`${stats.catch_id}\``, inline: true },
                                { name: '🐟 Fish', value: caughtFish.name, inline: true },
                                { name: '📏 Length', value: `${stats.length} inches`, inline: true },
                                { name: '⚖️ Weight', value: `${stats.weight} lbs`, inline: true },
                                { name: '💰 Value', value: formatCurrency(stats.value), inline: true },
                                { name: '✨ Rarity', value: `${getRarityStars(caughtFish.rarity)}`, inline: true },
                                { name: '🎯 Preferred Bait', value: caughtFish.preferred_bait?.join(', ') || 'Any', inline: true }
                            )
                            .setFooter({ text: stats.isPerfect ? '🏆 Perfect Catch!' : 'MollyBot Fishing System' });

                        if (caughtFish.image_url) {
                            catchEmbed.setThumbnail(caughtFish.image_url);
                        }

                        await hookInteraction.update({ embeds: [catchEmbed], components: [] });
                    });

                    // Set up the bite after random time
                    setTimeout(async () => {
                        fishBiting = true;
                        await interaction.editReply({
                            embeds: [embed
                                .setColor('#ffaa00')
                                .setDescription('🎣 A fish is biting! Quick, hook it!')
                            ],
                            components: [hookRow]
                        });

                        // Fish escapes after bite window
                        setTimeout(async () => {
                            if (hookCollector.ended) return;
                            fishBiting = false;
                            hookCollector.stop('timeout');
                        }, BITE_WINDOW_MS);
                    }, biteTime);

                    // Handle end states
                    hookCollector.on('end', async (collected, reason) => {
                        if (reason === 'time' || reason === 'timeout') {
                            await interaction.editReply({
                                embeds: [embed
                                    .setColor('#ff0000')
                                    .setDescription('The fish got away! You were too slow!')
                                ],
                                components: []
                            });
                        }
                    });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({
                        embeds: [embed.setColor('#808080').setDescription('Fishing prompt expired.')],
                        components: []
                    });
                }
            });

        } catch (error) {
            console.error('Error in fish command:', error);
            await interaction.reply({
                content: 'There was an error checking your fishing supplies.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default fish;
