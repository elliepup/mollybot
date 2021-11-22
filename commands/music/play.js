const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const { QueryType } = require('discord-player');
const { MessageEmbed } = require('discord.js');
const playdl = require('play-dl')
const Users = require('../../models/Users')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music given a YouTube title or link.')
        .addStringOption(option =>
            option.setName('video')
                .setDescription('The title or link of the YouTube video.')
                .setRequired(true)),
    async execute(interaction) {
        const { player } = require('../../src/index')
           
        const voiceChannel = interaction.member.voice.channel;
        //if the person is not currently in a voice channel
        if(!voiceChannel) {
            return interaction.reply({
                content: "Please join a voice channel before attempting to play music.",
                ephemeral: true,
            })
        }

        player.on("trackStart", (queue, track) => queue.metadata.channel.send({
            embeds:
                [new MessageEmbed()
                    .setTitle('Song now playing')
                    .setDescription(`🎶${bold('Now playing: ')}🎶[${bold(track.title)}](${track.url}) ${bold('[' + track.duration + ']')}`)
                    .setFooter(`Requested by ${track.requestedBy.username}`, track.requestedBy.displayAvatarURL({ dynamic: true }))
                    .setColor('#00DEFF')
                ]
        }))
        
        //if the bot does not have sufficient permissions to connect and/or speak
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) { 
            return interaction.reply({ 
                content: "I do not have permissions to connect or speak in the voice channel."
            })
        }

        const query = interaction.options.getString("video");
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
            if(!queue.connection) await queue.connect(interaction.member.voice.channel);
        } catch(error) {
            queue.destroy();
            console.error(error);
            return await interaction.reply({
                content: "I was unable to join the voice channel.",
                ephemeral: true,
            })
        }

        await interaction.deferReply();
        const track = await player.search(query, {
            requestedBy: interaction.user,
        }).then(x => x.tracks[0]);
        if (!track) return interaction.followUp({
            content: "I was unable to find the video. Please ensure you have entered the title or link correctly.",
            ephemeral: true,
        })

        let userData = await Users.findOne({ userId: interaction.user.id });
        if (!userData) {
            await Users.create({ userId: target.id }).then((newData) => userData = newData)
        }

        await Users.findOneAndUpdate({userData}, {$inc: {songsPlayed: 1}})

        queue.play(track);

        const embed = new MessageEmbed()
        .setTitle('🎶New song added to the queue🎶')
        .setColor('#00DEFF')
        .setDescription(`[${track.title}](${track.url}) ${bold('[' + track.duration + ']')}`)
        .setFooter(`Requested by ${track.requestedBy.username}`, track.requestedBy.displayAvatarURL({dynamic: true}))

        return await interaction.followUp({
            embeds: [embed],
        })
        
    }
    
}