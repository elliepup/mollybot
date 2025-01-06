import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { getTackleBox } from '../../services/fishingService';

const baitEmojis: { [key: string]: string } = {
    worms: '🪱',
    shrimp: '🍤',
    crickets: '🦗',
    leeches: '🪲',
    minnows: '🐟',
    nightcrawlers: '🪰'
};

const tacklebox: Command = {
    data: new SlashCommandBuilder()
        .setName('tacklebox')
        .setDescription('Check your or another user\'s tackle box')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to check tackle box for')
                .setRequired(false)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user') || interaction.user;
            const tackleBox = await getTackleBox(targetUser.id);

            if (!tackleBox) {
                await interaction.reply({
                    content: targetUser.id === interaction.user.id 
                        ? "You don't have a tackle box yet! Buy some at the shop to get one!"
                        : "This user doesn't have a tackle box yet!",
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle(`🎣 ${targetUser.username}'s Tackle Box`)
                .setDescription('Here\'s all the bait in this tackle box:')
                .addFields(
                    Object.entries(baitEmojis).map(([bait, emoji]) => ({
                        name: `${emoji} ${bait.charAt(0).toUpperCase() + bait.slice(1)}`,
                        value: `${tackleBox[bait as keyof typeof tackleBox]} pieces`,
                        inline: true
                    }))
                )
                .setFooter({ text: 'MollyBot Fishing System' })
                .setTimestamp();

            if (targetUser.avatar) {
                embed.setThumbnail(targetUser.displayAvatarURL());
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in tacklebox command:', error);
            await interaction.reply({
                content: 'There was an error fetching the tackle box.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default tacklebox;
