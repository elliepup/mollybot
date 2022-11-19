const discord = require('discord.js');

async function mediaController (interaction) {


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
        .addFields( { name: 'Progress', value: `${queue.createProgressBar()}` } ) 
        .setFooter({ text: `Requested by ${queue.current.requestedBy.username}`, iconURL: queue.current.requestedBy.displayAvatarURL( { dynamic: true} ) });


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
                .setDisabled(true)
        );

    //create the second row of buttons
    rowTwo = new discord.ActionRowBuilder()
        .addComponents(
            new discord.ButtonBuilder()
                .setCustomId('shuffle')
                .setLabel('🔀')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(true),
            new discord.ButtonBuilder()
                .setCustomId('loop')
                .setLabel('🔁')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(true),
            new discord.ButtonBuilder()
                .setCustomId('stop')
                .setLabel('⏹')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(true),
            new discord.ButtonBuilder()
                .setCustomId('leave')
                .setLabel('🚪')
                .setStyle(discord.ButtonStyle.Secondary)
                .setDisabled(true)
        );

        //send the embed
        await interaction.reply({
            embeds: [embed],
            components: [rowOne, rowTwo],
            fetchReply: true
        });

        //time for the fun part :')
        //create a collector for the buttons and listen for button presses by the user who sent the command
        const filter = i => i.user.id === interaction.user.id;
        const timeout = 60000;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: timeout });

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



            //if they pressed the volume down button
            if (i.customId === 'volumeDown') {
                //if the volume is already at 0, send an ephemeral message 
                if (queue.volume === 0) return await i.reply({
                    content: "The volume is already at 0.",
                    ephemeral: true
                });
                //otherwise, decrease the volume by 10
                queue.setVolume(queue.volume - 10);
                //edit the embed to show the new volume
                embed.setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) \nVolume: ${queue.volume}%`);
                //edit the message with the new embed
                return await i.update({ embeds: [embed] });
            }

            //if they pressed the volume up button
            else if (i.customId === 'volumeUp') {
                //if the volume is already at 100, send an ephemeral message 
                if (queue.volume === 100) return await i.reply({
                    content: "The volume is already at 100.",
                    ephemeral: true
                });
                //otherwise, increase the volume by 10
                queue.setVolume(queue.volume + 10);
                //edit the embed to show the new volume
                embed.setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) \nVolume: ${queue.volume}%`);
                //edit the message with the new embed
                return await i.update({ embeds: [embed] });
            }

            //if they pressed the pause/play button
            else if (i.customId === 'pausePlay') {
                //if the queue is paused, resume it
                if (queue.connection.paused) {
                    queue.setPaused(false);
                    //edit the embed to show that the queue is no longer paused
                    embed.setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) \nUnpaused`);
                    //edit the message with the new embed
                    return await i.update({ embeds: [embed] });
                }

                //if the queue is not paused, pause it
                else {
                    queue.setPaused(true);
                    //edit the embed to show that the queue is paused
                    embed.setDescription(`Currently playing: [${queue.current.title}](${queue.current.url}) \nPaused`);
                    //edit the message with the new embed
                    return await i.update({ embeds: [embed] });
                }
            }           
        });
}

module.exports = mediaController;