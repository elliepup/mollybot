const { SlashCommandBuilder } = require('@discordjs/builders');
const playdl = require('play-dl')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription(`Joins the voice channel the user is in.`),
    async execute(interaction) {
        const { player } = require('../../src/index')

        //const voiceIdiot = interaction.client.voice.adapters.get(interaction.guildId);
        const voiceQueue = player.getQueue(interaction.guildId)
        if (voiceQueue) return interaction.reply({
            content: "I am already in the voice channel.",
            ephemeral: true,
        });

        const voiceChannel = interaction.member.voice.channel;
        //if the person is not currently in a voice channel
        if(!voiceChannel) {
            return interaction.reply({
                content: "Please join a voice channel first.",
                ephemeral: true,
            })
        }
        
        //if the bot does not have sufficient permissions to connect and/or speak
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) { 
            return interaction.reply({ 
                content: "I do not have permissions to connect or speak in the voice channel."
            })
        }


        //creation of the queue and connection for future use
        const queue = player.createQueue(interaction.guild, {
            leaveOnEnd: false,
            leaveOnEmpty: false,
            leaveOnStop: false,
            metadata: {
                channel: interaction.channel,
                guild: interaction.guild,
                loop: false,
            },
            spotifyBridge: false,
            async onBeforeCreateStream(track, source) {
                if (source === ('youtube')) {
                    return (await playdl.stream(track.url)).stream;
                }
                else if (source === ('spotify')) {
                    const songs = await player.search(track.title, {
                        requestedBy: interaction.member,
                    })
                        .catch()
                        .then(x => x.tracks[0]);
                    return (await playdl.stream(song.url.stream)).stream;
                }
            }
        })

        try {
            if (!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch (error) {
            queue.destroy();
            console.error(error);
            return await interaction.reply({
                content: "I was unable to join the voice channel.",
                ephemeral: true,
            })
        }

        interaction.reply({
            content: "Joined the voice channel.",
            ephemeral: true,
        })
    }
}