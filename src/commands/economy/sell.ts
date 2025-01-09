import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { sellFish } from '../../services/economyService';
import { formatCurrency } from '../../utils/formatters';

const sell: Command = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell items from your inventory')
        .addStringOption(option =>
            option
                .setName('catch_id')
                .setDescription('The unique identifier of the item (e.g., fish catch ID)')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const catchId = interaction.options.getString('catch_id', true);
            const result = await sellFish(interaction.user.id, catchId);

            if (!result.success) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Sale Failed')
                    .setDescription(result.error!)
                    .setFooter({ text: 'MollyBot Economy System' });

                await interaction.reply({
                    embeds: [errorEmbed],
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💰 Sale Successful!')
                .setDescription([
                    `You sold your ${result.fishName} for ${formatCurrency(result.value!)}!`,
                    `New balance: ${formatCurrency(result.newBalance!)}`
                ].join('\n'))
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error in sell command:', error);
            await interaction.reply({
                content: 'There was an error processing your sale.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default sell;