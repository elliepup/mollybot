const discord = require('discord.js');

async function mediaController(interaction) {


    //check for queue
    const queue = interaction.client.player.getQueue(interaction.guildId);
    if (!queue || !queue.current) return await interaction.reply({
        content: "There is no music currently playing.",
        ephemeral: true,
    })

    //create the embed
    const embed = new discord.EmbedBuilder()
        .setTitle('🎶Media Controller🎶')
        .setColor('#82E4FF')
        .setThumbnail(queue.current.thumbnail)
        .setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) `)
        .addFields({ name: 'Progress', value: `${queue.createProgressBar()}` })
        .setFooter({ text: `Requested by ${queue.current.requestedBy.username}`, iconURL: queue.current.requestedBy.displayAvatarURL({ dynamic: true }) });


    //create the first row of buttons
    rowOne = new discord.ActionRowBuilder()
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId('volumeDown')
                .setLabel('🔉')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
            new discord.ButtonBuilder()
                .setCustomId('volumeUp')
                .setLabel('🔊')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
            new discord.ButtonBuilder()
                .setCustomId('pausePlay')
                .setLabel('⏯')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
            new discord.ButtonBuilder()
                .setCustomId('skip')
                .setLabel('⏭')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false)
        );

    //create the second row of buttons
    rowTwo = new discord.ActionRowBuilder()
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId('shuffle')
                .setLabel('🔀')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
            new discord.ButtonBuilder()
                .setCustomId('loop')
                .setLabel('🔁')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
            new discord.ButtonBuilder()
                .setCustomId('stop')
                .setLabel('⏹')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(false),
        );

    //send the embed
    const msg = await interaction.reply({
        embeds: [embed],
        components: [rowOne, rowTwo],
        fetchReply: true
    });

    //time for the fun part :')
    //create a collector for the buttons and listen for button presses by the user who sent the command
    const filter = i => i.user.id === interaction.user.id;
    const timeout = 60000;
    const collector = msg.createMessageComponentCollector({ filter, time: timeout });

    //when a button is pressed
    collector.on('collect', async i => {

        //if the queue is empty or the bot is not in a voice channel, disable all buttons
        if (!queue || !queue.connection) {
            rowOne.components.forEach(button => button.setDisabled(true));
            rowTwo.components.forEach(button => button.setDisabled(true));

            return await i.update({
                embeds: new discord.EmbedBuilder()
                    .setTitle('🎶Media Controller🎶')
                    .setColor('#82E4FF')
                    .setDescription(`The queue has ended. Use \`/play\` to add more songs to the queue.`),
                components: [rowOne, rowTwo]
            });

        }

        //update the embed thumbnail and description to the current song thumbnail regardless of what button is pressed and update the progress bar
        embed.setThumbnail(queue.current.thumbnail)
            .setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) `)
            .setFields({ name: 'Progress', value: `${queue.createProgressBar()}` });


        //too lazy to go back and make this a switch statement so if else it is
        //if they pressed the volume down button
        if (i.customId === 'volumeDown') {
            //if the volume is already at 0, send an ephemeral message 
            if (queue.volume === 0) return await i.reply({
                content: "The volume is already at 0.",
                ephemeral: true
            });
            //otherwise, decrease the volume by 10
            queue.setVolume(queue.volume - 10);
            return await i.update({ embeds: [embed] });
        }

        //if they pressed the volume up button
        if (i.customId === 'volumeUp') {
            //if the volume is already at 100, send an ephemeral message 
            if (queue.volume === 100) return await i.reply({
                content: "The volume is already at 100.",
                ephemeral: true
            });
            //otherwise, increase the volume by 10
            queue.setVolume(queue.volume + 10);
            return await i.update({ embeds: [embed] });
        }

        //if they pressed the pause/play button
        if (i.customId === 'pausePlay') {
            //if the queue is paused, resume it
            if (queue.connection.paused) {
                queue.setPaused(false);
                return await i.update({ embeds: [embed] });
            }

            //if the queue is not paused, pause it
            else {
                queue.setPaused(true);
                return await i.update({ embeds: [embed] });
            }
        }

        //if they pressed the skip button
        if (i.customId === 'skip') {
            //if the queue is empty, send an ephemeral message
            if (!queue || !queue.current) return await i.reply({
                content: "There is nothing to skip.",
                ephemeral: true
            });

            //gets next song in queue if it exists; index 0 is the next track
            const nextSong = queue.tracks[0];

            if (!nextSong) {
                embed.setDescription(`The queue has ended. Use \`/play\` to add more songs to the queue.`)
                    .setThumbnail('https://media.tenor.com/P3RqQUUK9BAAAAAd/rip-juice-cry.gif');

                rowOne.components.forEach(button => button.setDisabled(true));
                rowTwo.components.forEach(button => button.setDisabled(true));
                queue.skip();
                return await i.update({
                    embeds: [embed],
                    components: [rowOne, rowTwo]
                });
            }

            //skip the current song
            queue.skip();
            //edit the embed to show the new song
            embed
                .setDescription(`Currently playing: [${nextSong.title}](${nextSong.url}) `)
                .setThumbnail(nextSong.thumbnail)
                .setFields({ name: 'Progress', value: `${queue.createProgressBar()}` });
            //edit the message with the new embed
            return await i.update({ embeds: [embed] });
        }

        //if they press the shuffle button
        if (i.customId === 'shuffle') {
            //if the queue is empty, send an ephemeral message
            if (!queue || !queue.current) return await i.reply({
                content: "There is nothing to shuffle.",
                ephemeral: true
            });

            //shuffle the queue
            queue.shuffle();
            //send an ephemeral message
            return await i.reply({
                content: "The queue has been shuffled.",
                ephemeral: true
            });            
        }

        //if they press the loop button
        if (i.customId === 'loop') {
            //if the queue is empty, send an ephemeral message
            if (!queue || !queue.current) return await i.reply({
                content: "There is nothing to loop.",
                ephemeral: true
            });

            //if the queue is already looping, disable looping
            if (queue.repeatMode) {
                queue.setRepeatMode(0);
                return await i.reply({
                    content: "Looping has been disabled.",
                    ephemeral: true
                });
            }

            //if the queue is not looping, enable looping
            else {
                queue.setRepeatMode(2);
                return await i.reply({
                    content: "Looping has been enabled.",
                    ephemeral: true
                });
            }
        }


        //if they press the stop button
        if (i.customId === 'stop') {

            //disable all buttons
            rowOne.components.forEach(button => button.setDisabled(true));
            rowTwo.components.forEach(button => button.setDisabled(true));

            //if the queue is empty, send an ephemeral message
            if (!queue || !queue.current) return await i.reply({
                content: "There is nothing to stop.",
                ephemeral: true
            });

            //stop the queue
            queue.stop();
            queue.connection.disconnect();

            //send an ephemeral message
            await await i.update({
                embeds: [embed],
                components: [rowOne, rowTwo]
            });   
        }
    });

    //when the collector times out 
    collector.on('end', async collected => {
        //disable all buttons
        rowOne.components.forEach(button => button.setDisabled(true));
        rowTwo.components.forEach(button => button.setDisabled(true));
        //edit the message with the new embed
        return await interaction.editReply({ components: [rowOne, rowTwo] });
    });

}

module.exports = mediaController;