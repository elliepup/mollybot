import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getRodById } from '../../services/fishing/rodService';
import { equipRod } from '../../services/fishing';
import { getRarityStars } from '../../utils/rarityUtils';

const equip: Command = {
    data: new SlashCommandBuilder()
        .setName('equip')
        .setDescription('Equip a fishing rod')
        .addStringOption(option =>
            option
                .setName('rod_id')
                .setDescription('The ID of the rod to equip')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const rodId = interaction.options.getString('rod_id', true);

            // First check if the rod exists and belongs to the user
            const rod = await getRodById(rodId);
            if (!rod || rod.user_id !== interaction.user.id) {
                await interaction.reply({
                    content: 'Could not find a rod with that ID in your collection.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Attempt to equip the rod
            const result = await equipRod(interaction.user.id, rodId);

            if (!result.success) {
                await interaction.reply({
                    content: result.error,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🎣 Rod Equipped!')
                .setDescription([
                    `Successfully equipped your ${getRarityStars(rod.info.rarity)} ${rod.info.name}!`,
                    '',
                    '**Rod Stats:**',
                    `• 🎯 Hook Speed: \`${rod.info.perks.hook_speed}x\``,
                    `• ⏱️ Bite Window: \`${rod.info.perks.bite_window}x\``,
                    `• 🍀 Luck: \`${rod.info.perks.luck}x\``,
                    rod.info.perks.passive ? `• 💫 Passive: ${rod.info.perks.passive}` : ''
                ].join('\n'))
                .setFooter({ text: 'MollyBot Fishing System' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in equip command:', error);
            await interaction.reply({
                content: 'There was an error equipping the rod.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default equip;