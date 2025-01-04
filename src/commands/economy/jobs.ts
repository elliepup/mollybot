import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import jobs from '../../data/jobs.json';
import { JobList } from '../../types/Job';
import { createPagination } from '../../utils/paginationHandler';

const jobTierEmojis = {
    entry_level: '🔰',
    regular: '💼',
    professional: '👔'
};

const jobTierNames = {
    entry_level: 'Entry Level Jobs',
    regular: 'Regular Jobs',
    professional: 'Professional Jobs'
};

const jobs_command: Command = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('View all available jobs'),

    async execute(interaction) {
        const allJobs = jobs as JobList;
        const tiers = Object.keys(allJobs) as Array<keyof typeof jobTierEmojis>;

        // Create embeds for each tier
        const pages = tiers.map((tier, index) => {
            const jobList = allJobs[tier];
            return new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`${jobTierEmojis[tier]} ${jobTierNames[tier]}`)
                .setDescription(
                    jobList.map(job => 
                        `**${job.name}** (ID: \`${job.id}\`)\n` +
                        `• ${job.description}\n` +
                        `• Pay: $${job.minPay} - $${job.maxPay}\n`
                    ).join('\n')
                )
                .setFooter({ 
                    text: `Page ${index + 1}/${tiers.length} • Use /apply <job_id> to apply for a job`
                });
        });

        await createPagination(interaction, { pages });
    }
};

export default jobs_command;
