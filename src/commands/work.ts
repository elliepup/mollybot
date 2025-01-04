import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../interfaces/Command';
import { processWork, getOrCreateProfile } from '../utils/profileHandler';
import { formatCooldown } from '../utils/timeUtils';

const workResponses = [
    "You helped an old lady cross the street",
    "You washed someone's car",
    "You delivered some packages",
    "You walked a few dogs",
    "You helped clean up the park",
    "You did some gardening work"
];

const work: Command = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money (Available every 4 hours)') as SlashCommandBuilder,

    async execute(interaction) {
        try {
            // Create profile if it doesn't exist
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

            const randomResponse = workResponses[Math.floor(Math.random() * workResponses.length)];
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💼 Work Complete!')
                .setDescription(`${randomResponse} and earned $${result.earned}!`)
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
