import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { createPagination } from '../../utils/paginationHandler';

const commandInfo = {
    economy: {
        title: 'Economy Commands',
        commands: [
            { name: '`/work`', description: 'Work to earn money (Available every 4 hours)' },
            { name: '`/daily`', description: 'Claim your daily reward (Every 24 hours) and build a streak' },
            { name: '`/balance [user]`', description: 'Check your or another user\'s balance' },
            { name: '`/deposit <amount>`', description: 'Deposit money into your bank account' },
            { name: '`/withdraw <amount>`', description: 'Withdraw money from your bank account' },
            { name: '`/apply <job_id>`', description: 'Apply for a job (Available every 24 hours)' },
            { name: '`/jobs`', description: 'View available jobs' },
            { name: '`/job [user]`', description: 'Check your or another user\'s job' },
            { name: '`/leaderboard`', description: 'View the economy leaderboard' }
        ]
    },
    misc: {
        title: 'Misc Commands',
        commands: [
            { name: '`/ping`', description: 'Check if the bot is alive' },
            { name: '`/help`', description: 'Show this help message' }
        ]
    }
};

const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows information about available commands'),

    async execute(interaction) {
        const pages: EmbedBuilder[] = [];

        // Create economy commands page
        const economyEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💰 Economy Commands')
            .setDescription('```\nArgument notation:\n[optional] <required>\n```\nAll available economy commands:')
            .addFields(
                commandInfo.economy.commands.map(cmd => ({
                    name: cmd.name,
                    value: `> ${cmd.description}`,
                }))
            )
            .setFooter({ text: 'Page 1/2 • MollyBot Help System' });
        pages.push(economyEmbed);

        // Create misc commands page
        const miscEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔧 Misc Commands')
            .setDescription('All available miscellaneous commands:')
            .addFields(
                commandInfo.misc.commands.map(cmd => ({
                    name: cmd.name,
                    value: `> ${cmd.description}`,
                }))
            )
            .setFooter({ text: 'Page 2/2 • MollyBot Help System' });
        pages.push(miscEmbed);

        // Use pagination handler
        await createPagination(interaction, {
            pages,
            timeout: 300000, // 5 minutes
            prevLabel: 'Previous',
            nextLabel: 'Next'
        });
    }
};

export default help;
