import { SlashCommandBuilder, EmbedBuilder, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { pullRod, RodRarity } from '../../services/fishing/gachaService';
import { getRarityColor, getRarityStars } from '../../utils/rarityUtils';
import { RodData } from '../../types/Fishing';
import rodData from '../../data/rods.json';

const pull: Command = {
    data: new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Pull for fishing rods using astral essence')
        .addBooleanOption(option =>
            option
                .setName('multi')
                .setDescription('Perform a 10x pull (2700 essence, 10% discount)')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const isMultiPull = interaction.options.getBoolean('multi') ?? false;
            const cost = isMultiPull ? 2700 : 300;

            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_pull')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_pull')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(confirmButton, cancelButton);

            // Create confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('🎣 Confirm Pull')
                .setDescription([
                    `Are you sure you want to perform a${isMultiPull ? ' 10x' : ''} pull?`,
                    '',
                    `Cost: ${cost} astral essence`,
                    isMultiPull ? '(10% discount applied)' : '',
                    '',
                    'Drop Rates:',
                    '• Common: 60%',
                    '• Uncommon: 25%',
                    '• Rare: 10%',
                    '• Epic: 4%',
                    '• Legendary: 0.8%',
                    '• Mythical: 0.2%'
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
                        content: 'This confirmation is not for you!',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }

                if (i.customId === 'cancel_pull') {
                    await i.update({
                        content: 'Pull cancelled.',
                        embeds: [],
                        components: []
                    });
                    return;
                }

                const result = await pullRod(interaction.user.id, isMultiPull);

                if (!result.success) {
                    await i.update({
                        content: result.error,
                        embeds: [],
                        components: []
                    });
                    return;
                }

                const embedColor = result.results!.reduce((color: RodRarity, rod) => {
                    const rodRarityValue = getRarityValue(rod.rarity);
                    const currentColorValue = getRarityValue(color);
                    return rodRarityValue > currentColorValue ? rod.rarity : color;
                }, 'common' as RodRarity);

                const embed = new EmbedBuilder()
                    .setColor(getRarityColor(embedColor))
                    .setTitle(`🎣 Fishing Rod ${isMultiPull ? '10x Pull' : 'Single Pull'}`)
                    .setDescription([
                        `<@${interaction.user.id}>'s pull results:`,
                        '',
                        ...result.results!.map(rod => {
                            const typedRodData = rodData as RodData;
                            const rodInfo = typedRodData.rods[rod.rod_type];
                            return [
                                `${rod.isNew ? '✨ NEW! ' : ''}`,
                                `\`${rod.rod_id}\` · \`${getRarityStars(rod.rarity)}\` · ${rodInfo.name}`,
                                `┗ *${rodInfo.description}*`,
                                `• 🎯 Hook Speed: \`${rodInfo.perks.hook_speed}x\``,
                                `• ⏱️ Bite Window: \`${rodInfo.perks.bite_window}x\``,
                                `• 🍀 Luck: \`${rodInfo.perks.luck}x\``,
                                rodInfo.perks.passive ? `• 💫 Passive: ${rodInfo.perks.passive}` : '',
                                ''
                            ].join('\n');
                        }),
                        `New essence balance: ${result.newBalance} ✨`
                    ].join('\n'))
                    .setFooter({ text: 'MollyBot Fishing System' })
                    .setTimestamp();

                await i.update({ embeds: [embed], components: [] });
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    await interaction.editReply({
                        content: 'Pull confirmation timed out.',
                        embeds: [],
                        components: []
                    });
                }
            });

        } catch (error) {
            console.error('Error in pull command:', error);
            await interaction.reply({
                content: 'There was an error processing your pull.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

function getRarityValue(rarity: RodRarity): number {
    const values: Record<RodRarity, number> = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
        mythical: 5
    };
    return values[rarity];
}

export default pull;