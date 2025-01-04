import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType, 
    EmbedBuilder, 
    InteractionResponse, 
    Message, 
    ChatInputCommandInteraction
} from 'discord.js';

export interface PaginationOptions {
    pages: EmbedBuilder[];
    timeout?: number;
    prevLabel?: string;
    nextLabel?: string;
    prevEmoji?: string;
    nextEmoji?: string;
}

export async function createPagination(
    interaction: ChatInputCommandInteraction,
    options: PaginationOptions
): Promise<void> {
    let currentPage = 0;
    const { pages, timeout = 60000, prevLabel = 'Previous', nextLabel = 'Next' } = options;

    // Create navigation buttons
    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel(prevLabel)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel(nextLabel)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pages.length <= 1)
    );

    // Send initial embed
    await interaction.reply({
        embeds: [pages[currentPage]],
        components: [buttons]
    });

    const message = await interaction.fetchReply();

    // Create button collector
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: timeout
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ 
                content: 'These buttons aren\'t for you!', 
                ephemeral: true 
            });
            return;
        }

        // Update current page based on button pressed
        if (i.customId === 'prev') currentPage--;
        if (i.customId === 'next') currentPage++;

        // Update button states
        buttons.components[0].setDisabled(currentPage === 0);
        buttons.components[1].setDisabled(currentPage === pages.length - 1);

        // Update embed
        await i.update({
            embeds: [pages[currentPage]],
            components: [buttons]
        });
    });

    collector.on('end', () => {
        // Disable all buttons when collector expires
        buttons.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [buttons] }).catch(() => {});
    });
}
