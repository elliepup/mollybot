import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
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
            const result = await pullRod(interaction.user.id, isMultiPull);

            if (!result.success) {
                await interaction.reply({
                    content: result.error,
                    flags: MessageFlags.Ephemeral
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

            await interaction.reply({ embeds: [embed] });

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