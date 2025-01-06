import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getFishByCatchId } from '../../services/fishingService';
import { getRarityColor, getRarityStars } from '../../utils/rarityUtils';
import { formatCurrency } from '../../utils/formatters';

const view: Command = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View detailed information about a caught fish')
        .addStringOption(option =>
            option
                .setName('catch_id')
                .setDescription('The ID of the fish to view')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const catchId = interaction.options.getString('catch_id', true);
            const fish = await getFishByCatchId(catchId);

            if (!fish) {
                await interaction.reply({
                    content: 'Could not find a fish with that catch ID.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const isOriginalOwner = fish.current_owner_id === fish.original_owner_id;

            const embed = new EmbedBuilder()
                .setColor(getRarityColor(fish.rarity))
                .setTitle(`🐟 ${fish.name}`)
                .setDescription(`A ${fish.rarity.toLowerCase()} fish caught on <t:${Math.floor(new Date(fish.caught_at).getTime() / 1000)}:F>`)
                .addFields(
                    { name: '🎫 Catch ID', value: `\`${fish.catch_id}\``, inline: true },
                    { name: '✨ Rarity', value: getRarityStars(fish.rarity), inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '📏 Length', value: `${fish.length.toFixed(1)}"`, inline: true },
                    { name: '⚖️ Weight', value: `${fish.weight.toFixed(1)} lbs`, inline: true },
                    { name: '💰 Value', value: formatCurrency(fish.value), inline: true },
                    { 
                        name: '👤 Current Owner', 
                        value: `<@${fish.current_owner_id}>`, 
                        inline: true 
                    }
                )
                .setFooter({ text: 'MollyBot Fishing System' })
                .setTimestamp();

            // Add original owner field only if different from current owner
            if (!isOriginalOwner) {
                embed.addFields({ 
                    name: '🎣 Original Catcher', 
                    value: `<@${fish.original_owner_id}>`, 
                    inline: true 
                });
            }

            // Add thumbnail if image exists
            if (fish.image_url) {
                embed.setThumbnail(fish.image_url);
            }

            // Add mutation and shiny status if they exist
            if (fish.mutation) {
                embed.addFields({ 
                    name: '🧬 Mutation', 
                    value: fish.mutation.charAt(0).toUpperCase() + fish.mutation.slice(1), 
                    inline: true 
                });
            }
            if (fish.shiny) {
                embed.addFields({ 
                    name: '✨ Special', 
                    value: 'Shiny', 
                    inline: true 
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in view command:', error);
            await interaction.reply({
                content: 'There was an error viewing the fish.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default view;
