import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getFishByCatchId, getRodById } from '../../services/fishing';
import { getRarityColor, getRarityStars } from '../../utils/rarityUtils';
import { formatCurrency } from '../../utils/formatters';

const view: Command = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('View detailed information about a caught fish or fishing rod')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('What to view')
                .setRequired(true)
                .addChoices(
                    { name: '🐟 Fish', value: 'fish' },
                    { name: '🎣 Rod', value: 'rod' }
                )
        )
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('The ID of the fish/rod to view')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const viewType = interaction.options.getString('type', true);
            const id = interaction.options.getString('id', true);

            if (viewType === 'fish') {
                const fish = await getFishByCatchId(id);
                if (!fish) {
                    await interaction.reply({
                        content: 'Could not find a fish with that ID.',
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
                        { name: '👤 Current Owner', value: `<@${fish.current_owner_id}>`, inline: true }
                    );

                if (!isOriginalOwner) {
                    embed.addFields({ 
                        name: '🎣 Original Catcher', 
                        value: `<@${fish.original_owner_id}>`, 
                        inline: true 
                    });
                }

                if (fish.image_url) {
                    embed.setThumbnail(fish.image_url);
                }

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
            } else {
                const rod = await getRodById(id);
                if (!rod) {
                    await interaction.reply({
                        content: 'Could not find a rod with that ID.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor(getRarityColor(rod.info.rarity))
                    .setTitle(`🎣 ${rod.info.name}`)
                    .setDescription([
                        `*${rod.info.description}*`,
                        '',
                        '**Stats**',
                        `• 🎫 Rod ID: \`${rod.rod_id}\``,
                        `• ✨ Rarity: \`${getRarityStars(rod.info.rarity)}\``,
                        `• 🎯 Hook Speed: \`${rod.info.perks.hook_speed}x\``,
                        `• ⏱️ Bite Window: \`${rod.info.perks.bite_window}x\``,
                        `• 🍀 Luck: \`${rod.info.perks.luck}x\``,
                        rod.info.perks.passive ? `• 💫 Passive: ${rod.info.perks.passive}` : '',
                        '',
                        '**Catch Statistics**',
                        `• 📊 Total Catches: \`${rod.total_catches}\``,
                        `• Common: \`${rod.common_catches}\``,
                        `• Uncommon: \`${rod.uncommon_catches}\``,
                        `• Rare: \`${rod.rare_catches}\``,
                        `• Epic: \`${rod.epic_catches}\``,
                        `• Legendary: \`${rod.legendary_catches}\``,
                        `• Mythical: \`${rod.mythical_catches}\``,
                        '',
                        `Acquired: <t:${Math.floor(new Date(rod.acquired_at).getTime() / 1000)}:F>`
                    ].join('\n'))
                    .setFooter({ text: 'MollyBot Fishing System' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error in view command:', error);
            await interaction.reply({
                content: 'There was an error viewing the item.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default view;