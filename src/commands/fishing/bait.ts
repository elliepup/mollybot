import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { BaitType } from '../../types/Fishing';
import { setBait } from '../../services/fishing';

const bait: Command = {
    data: new SlashCommandBuilder()
        .setName('bait')
        .setDescription('Select your fishing bait')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Type of bait to use')
                .setRequired(true)
                .addChoices(
                    { name: '🪱 Worms', value: 'worms' },
                    { name: '🍤 Shrimp', value: 'shrimp' },
                    { name: '🦗 Crickets', value: 'crickets' },
                    { name: '🪲 Leeches', value: 'leeches' },
                    { name: '🐟 Minnows', value: 'minnows' },
                    { name: '🪰 Nightcrawlers', value: 'nightcrawlers' }
                )
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const baitType = interaction.options.getString('type', true) as BaitType;
            const result = await setBait(interaction.user.id, baitType);

            const embed = new EmbedBuilder()
                .setTitle('🎣 Bait Selection')
                .setColor(result.baitCount > 0 ? '#00ff00' : '#ff9900')
                .setDescription(
                    result.baitCount > 0
                        ? `Successfully equipped ${baitType}! You have ${result.baitCount} remaining.`
                        : `⚠️ Warning: You've selected ${baitType} but you don't have any! Use \`/shop\` to buy some.`
                )
                .setFooter({ text: 'MollyBot Fishing System' })
                .setTimestamp();

            await interaction.reply({
                embeds: [embed],
                flags: result.baitCount > 0 ? undefined : MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error('Error in bait command:', error);
            await interaction.reply({
                content: 'There was an error changing your bait.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default bait;
