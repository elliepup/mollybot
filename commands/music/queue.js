const { SlashCommandBuilder, EmbedBuilder, IntegrationApplication } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current queue.'),
    async execute(interaction) {
        const client = interaction.client;
        const queue = client.player.getQueue(interaction.guild);

        if (!queue || !queue.current) return await interaction.reply({
            content: "There is no music currently playing.",
            ephemeral: true,
        })

        //TODO figure out why this is broken; for the time being, let user know it's broken
        await interaction.reply({
            content: "This command is currently broken. Please use the `playing` command instead.",
        })


        return;
        const maxSongsPerPage = 7;
        const tracks = [queue.current, ...queue.tracks];

        //put information about 7 songs on each page
        const pages = [];
        for (let i = 0; i < tracks.length; i += maxSongsPerPage) {
            const current = tracks.slice(i, maxSongsPerPage + i);
            const j = i;
            pages.push(new EmbedBuilder()
                .setColor('#03fc84')
                .setTitle("🎶Songs in the queue🎶")
                .setDescription(`Total songs in queue: ${tracks.length}\n` + current.map((track, i) => {
                    return `${i + j + 1} - [${track.title}](${track.url})`;
                }).join('\n'))
                .setFooter({ text: `Page ${i / maxSongsPerPage + 1} of ${Math.ceil(tracks.length / maxSongsPerPage)}`, iconURL: interaction.user.avatarURL })
            );
        }

        //pagination
        const buttonPagination = require('../../functions/pagination.js');
        buttonPagination(interaction, pages);




    }
}