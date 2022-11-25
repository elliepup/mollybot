const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock, SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('The sea is a dangerous place. Use this command to fish.')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('If you want to choose a specific location, use this option.')
                .setRequired(false)
                .setAutocomplete(true)),
    autocompleteOptions: ['sea', 'river'],
    async execute(interaction) {

        const userId = interaction.user.id;

        //get user's fishing profile
        const { data } = await interaction.client.supabase
            .rpc('get_fishing_profile', {
                user_id_in: interaction.user.id
            })


        //if no bait
        if (data.tier1_bait === 0 && data.tier2_bait === 0 && data.tier3_bait === 0 && data.tier4_bait === 0 && data.tier5_bait === 0) {
            return interaction.reply({
                content: `You don't have any bait!`,
                ephemeral: true
            })
        }

        const fishingCooldown = 5 * 60 * 1000; //5 minutes
        const lastFished = data.last_fished;
        const lastWorkedMs = lastFished == null ? 0 : new Date(lastFished).getTime();

        //if not enough time has passed since last fish
        if (Date.now() - lastWorkedMs < fishingCooldown) {
            const timeLeft = fishingCooldown - (Date.now() - lastWorkedMs);
            const timeLeftMinutes = Math.floor(timeLeft / 60000);
            const timeLeftSeconds = ((timeLeft % 60000) / 1000).toFixed(0);

            return interaction.reply({
                content: `You have already fished recently. Please wait \`${timeLeftMinutes}:${timeLeftSeconds < 10 ? '0' : ''}${timeLeftSeconds}\` before fishing again.`,
                ephemeral: true
            })
        }

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} has started fishing!`)
            .setColor("#82E4FF")
            .setDescription(blockQuote(`Please select the type of bait that you would like to use.`))
            .setFooter({ text: `This feature is currently in early access. Bugs are to be expected.` })

        const selectMenu = new SelectMenuBuilder()
            .setCustomId('fishing_bait')
            .setPlaceholder('Select a bait')

        //for each bait type that the user has, add a select option
        for (let i = 1; i <= 5; i++) {
            if (data[`tier${i}_bait`] > 0) {
                selectMenu.addOptions({
                    label: `Tier ${i} Bait`,
                    value: i.toString(),
                    description: `x${data[`tier${i}_bait`]}`,
                    emoji: '🐟'
                })
            }
        }


        const row = new ActionRowBuilder()
            .addComponents(selectMenu)

        const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        })

        //create collector
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 120000 });

        let baitChoice = null;

        collector.on('collect', async i => {

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_fishing')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('✖')
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_fishing')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✔')
            const hookButton = new ButtonBuilder()
                .setCustomId('hook_fishing')
                .setLabel('Hook')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎣')
            const row = new ActionRowBuilder()
            //if user selects a bait
            if (i.isSelectMenu()) {
                baitChoice = i.values[0];
                row.addComponents(cancelButton, confirmButton)
                //update embed
                embed.setDescription(`Are you sure you want to use **tier ${i.values[0]} bait**?\n${blockQuote(`Please note that after clicking confirm, ` +
                    ` you will be placed into the fishing minigame. There will be a **Hook Fish** button that you must click to catch the fish when ` +
                    `it bites. Don't click too early or you'll scare it away!`)}`)

                await i.update({
                    embeds: [embed],
                    components: [row]
                })
            } else {
                if (i.customId === 'cancel_fishing') {
                    embed
                        .setColor('#3F3F3F')
                        .setDescription(`${interaction.user.username} has decided not to fish.`)
                        row.setComponents(cancelButton, confirmButton)
                        row.components.forEach((button) => button.setDisabled(true));
                        
                    collector.stop();
                    return await i.update({
                        embeds: [embed],
                        components: [row]
                    })
                    
                }
                if (i.customId === 'confirm_fishing') {
                row.setComponents(hookButton)
                embed
                .setDescription(`This command is currently being worked on. Please check back later!`)
                .setColor('#3F3F3F')
                
                row.components.forEach((button) => button.setDisabled(true));
                collector.stop();
                return await i.update({
                    embeds: [embed],
                    components: [row]
                })
                
            }


        }
        })

    }
}