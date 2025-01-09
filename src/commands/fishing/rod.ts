import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getEquippedRod } from '../../services/fishing/rodService';
import { getRarityColor, getRarityStars } from '../../utils/rarityUtils';

const rod: Command = {
    data: new SlashCommandBuilder()
        .setName('rod')
        .setDescription('View your equipped fishing rod')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User whose rod to view')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const rod = await getEquippedRod(targetUser.id);

            if (!rod) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ No Rod Equipped')
                    .setDescription(targetUser.id === interaction.user.id
                        ? "You don't have a rod equipped! Use `/equip` to equip one!"
                        : "This user doesn't have a rod equipped!")
                    .setFooter({ text: 'MollyBot Fishing System' });

                await interaction.reply({ embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor(getRarityColor(rod.info.rarity))
                .setTitle(`🎣 ${targetUser.username}'s Equipped Rod`)
                .setDescription([
                    `**${rod.info.name}** · ${getRarityStars(rod.info.rarity)}`,
                    `*${rod.info.description}*`,
                    '',
                    '**Rod Details:**',
                    `• 🎫 Rod ID: \`${rod.rod_id}\``,
                    `• 🎯 Hook Speed: \`${rod.info.perks.hook_speed}x\``,
                    `• ⏱️ Bite Window: \`${rod.info.perks.bite_window}x\``,
                    `• 🍀 Luck: \`${rod.info.perks.luck}x\``,
                    rod.info.perks.passive ? `• 💫 Passive: ${rod.info.perks.passive}` : '',
                    '',
                    '**Catch Statistics:**',
                    `• 📊 Total Catches: \`${rod.total_catches}\``,
                    `• Common: \`${rod.common_catches}\``,
                    `• Uncommon: \`${rod.uncommon_catches}\``,
                    `• Rare: \`${rod.rare_catches}\``,
                    `• Epic: \`${rod.epic_catches}\``,
                    `• Legendary: \`${rod.legendary_catches}\``,
                    `• Mythical: \`${rod.mythical_catches}\``,
                    '',
                    `Acquired: <t:${Math.floor(new Date(rod.acquired_at).getTime() / 1000)}:R>`
                ].join('\n'))
                .setFooter({ text: 'MollyBot Fishing System' });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in rod command:', error);
            await interaction.reply({
                content: 'There was an error fetching the equipped rod.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default rod;