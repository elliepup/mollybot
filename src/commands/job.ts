import { SlashCommandBuilder, EmbedBuilder, User } from 'discord.js';
import { Command } from '../interfaces/Command';
import { getCurrentJob } from '../utils/profileHandler';

const job: Command = {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('View information about your current job')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user whose job you want to check')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const currentJob = await getCurrentJob(targetUser.id);

            if (!currentJob) {
                const embed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('❌ No Job')
                    .setDescription(`${targetUser.id === interaction.user.id ? 'You' : targetUser.username} currently doesn't have a job!\nUse \`/jobs\` to view available jobs.`)
                    .setFooter({ text: 'MollyBot Economy System' });

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`💼 Job: ${currentJob.name}`)
                .setDescription(`${targetUser.id === interaction.user.id ? 'Your' : `${targetUser.username}'s`} current job: ${currentJob.description}`)
                .addFields(
                    { name: 'Pay Range', value: `$${currentJob.minPay} - $${currentJob.maxPay}`, inline: true }
                )
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            if (targetUser.id !== interaction.user.id) {
                embed.setAuthor({
                    name: targetUser.username,
                    iconURL: targetUser.displayAvatarURL()
                });
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in job command:', error);
            await interaction.editReply('There was an error fetching the job information.');
        }
    }
};

export default job;
