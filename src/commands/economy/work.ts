import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { processWork, getOrCreateProfile } from '../../utils/profileHandler';
import { formatCooldown } from '../../utils/timeUtils';

const work: Command = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money (Available every 4 hours)') as SlashCommandBuilder,

    async execute(interaction) {
        try {
            await getOrCreateProfile(interaction.user.id, interaction.user.username);
            
            const result = await processWork(interaction.user.id);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Work Cooldown')
                    .setDescription(`You need to rest for ${formatCooldown(result.cooldownRemaining!)} before working again`)
                    .setFooter({ text: 'MollyBot Economy System' });

                await interaction.reply({ 
                    embeds: [embed], 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            const description = result.response || "You worked hard and";
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💼 Work Complete!')
                .setDescription(`${description} earned $${result.earned}!`)
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error processing work:', error);
            await interaction.reply({
                content: 'There was an error processing your work.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default work;
