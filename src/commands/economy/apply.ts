import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { applyForJob, getOrCreateProfile } from '../../utils/profileHandler';
import { formatCooldown } from '../../utils/timeUtils';

const apply: Command = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply for a job (Available every 24 hours)')
        .addStringOption(option =>
            option
                .setName('job_id')
                .setDescription('The ID of the job you want to apply for')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            // Create profile if it doesn't exist
            await getOrCreateProfile(interaction.user.id, interaction.user.username);
            
            const jobId = interaction.options.getString('job_id', true);
            const result = await applyForJob(interaction.user.id, jobId);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Application Failed')
                    .setFooter({ text: 'MollyBot Economy System' });

                if (result.cooldownRemaining) {
                    embed.setDescription(`You need to wait ${formatCooldown(result.cooldownRemaining)} before applying for another job`);
                } else if (result.error) {
                    embed.setDescription(result.error);
                }

                await interaction.reply({ 
                    embeds: [embed], 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Job Application Successful!')
                .setDescription('Congratulations! You got the job! Use `/work` to start earning money.')
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in apply command:', error);
            await interaction.reply({
                content: 'There was an error processing your job application.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default apply;
