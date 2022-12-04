const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock, SelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const LootTable = require('loot-table');

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

        let fishBit = false;
        let failed = false;
        let hooked = false;
        let randomFish;

        const userId = interaction.user.id;

        //get user's fishing profile
        let { data, error } = await interaction.client.supabase
            .rpc('get_fishing_profile', {
                user_id_in: userId
            })


        //if no bait
        if (data.tier1_bait === 0 && data.tier2_bait === 0 && data.tier3_bait === 0 && data.tier4_bait === 0 && data.tier5_bait === 0) {
            return interaction.reply({
                content: `You don't have any bait!`,
                ephemeral: true
            })
        }

        const fishingCooldown = 5 * 60000; //5 minutes
        //convert last_fished from string to ms
        let lastFished = data.last_fished;
        //check if able to fish
        const { ableToFish, timeLeft } = checkIfAbleToFish(data.last_fished, fishingCooldown);

        if (!ableToFish) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FF0000")
                        .setTitle('You are too tired to fish!')
                        .setDescription(`You need to wait \`${timeLeft}\` before you can fish again.`)
                        .addFields({name: "Last fished", value: `<t:${Math.floor(new Date(lastFished).getTime() / 1000)}>`}, 
                        {name: "Cooldown", value: `<t:${Math.floor((new Date(lastFished).getTime() + fishingCooldown) / 1000)}>`})
                ]
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
                .setStyle(ButtonStyle.Secondary)
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
                    //make sure not on cooldown

                    //refresh fishing profile
                    data = await interaction.client.supabase
                        .rpc('get_fishing_profile', {
                            user_id_in: userId
                        })

                    const updatedFishingProfile = data.data;
                    const { ableToFish, timeLeft } = checkIfAbleToFish(updatedFishingProfile.last_fished, fishingCooldown);

                    if (!ableToFish) {

                        //update embed
                        embed
                            .setColor('#3F3F3F')
                            .setDescription(`You can't fish yet. You need to wait ${timeLeft} more seconds.`)
                        row.setComponents(cancelButton, confirmButton)
                        row.components.forEach((button) => button.setDisabled(true));

                        collector.stop();
                        return await i.update({
                            embeds: [embed],
                            components: [row]
                        })

                    }

                    //confirm user has bait
                    if (updatedFishingProfile[`tier${baitChoice}_bait`] === 0) {
                        //update embed
                        embed
                            .setColor('#3F3F3F')
                            .setDescription(`You can't fish with that bait! You don't have any tier ${baitChoice} bait. You ought to go buy some more, boy!`)
                        row.setComponents(cancelButton, confirmButton)
                        row.components.forEach((button) => button.setDisabled(true));

                        collector.stop();
                        return await i.update({
                            embeds: [embed],
                            components: [row]
                        })

                    }

                    row.setComponents(hookButton)
                    embed
                        .setDescription(blockQuote(`You cast your line and begin fishing. Please wait for a fish to bite.` +
                            ` When a fish bites, click the **Hook Fish** button to catch it! Don't click too early or you'll scare it away!`))
                        .setColor('#d9d9d9')

                    await i.update({
                        embeds: [embed],
                        components: [row]
                    })

                    //generate random fish
                    data = await interaction.client.supabase
                        .rpc('get_available_fish')
                    let fish = data.data;

                    const lootTable = new LootTable();

                    const lootInfo = [
                        { rarity: 'Common', tableTotal: 400, amount: fish.filter(x => x.rarity == 'Common').length }, { rarity: 'Uncommon', tableTotal: 275, amount: fish.filter(x => x.rarity == 'Uncommon').length },
                        { rarity: 'Rare', tableTotal: 150, amount: fish.filter(x => x.rarity == 'Rare').length }, { rarity: 'Epic', tableTotal: 80, amount: fish.filter(x => x.rarity == 'Epic').length },
                        { rarity: 'Legendary', tableTotal: 25, amount: fish.filter(x => x.rarity == 'Legendary').length }, { rarity: 'Mythical', tableTotal: 2, amount: fish.filter(x => x.rarity == 'Mythical').length },
                    ]

                    switch (baitChoice) {
                        case '5':
                            fish = fish.filter(x => {return x.rarity != 'Epic'})
                        case '4':
                            fish = fish.filter(x => {return x.rarity != 'Rare'})
                        case '3':
                            fish = fish.filter(x => {return x.rarity != 'Uncommon'})
                        case '2':
                            fish = fish.filter(x => {return x.rarity != 'Common'})
                    }
                    
                    //eventually filter location as well

                    const dayMap = new Map();
                    dayMap.set('Morning', [5, 11]);
                    dayMap.set('Afternoon', [12, 17]);
                    dayMap.set('Evening', [18, 21]);
                    dayMap.set('Night', [22, 4]);

                    const currentHour = new Date().getHours();
                    //get time in daymap
                    let timeOfDay = null;
                    for (const [key, value] of dayMap) {
                        if (currentHour >= value[0] && currentHour <= value[1]) {
                            timeOfDay = key;
                        }
                    }

                    //filter fish by time of day or if the fish is available all day
                    fish = fish.filter(x => {return x.time_available == timeOfDay || x.time_available == 'All'})
                    
                    for(let i = 0; i < fish.length; i++) {
                        for (let j = 0; j < lootInfo.length; j++) {
                            if (fish[i].rarity == lootInfo[j].rarity) {
                                lootTable.add(fish[i], lootInfo[j].tableTotal / lootInfo[j].amount)
                            }
                        }
                    }
                    
                    randomFish = lootTable.choose();

                    if(!randomFish) {
                        embed
                        .setColor('#FC0000')
                            .setDescription(blockQuote(`There doesn't appear to be much activity in the water. You decide to call it a day.`))
                            .setFooter({text: 'You can fish again in 5 minutes.'})
                            row.setComponents(hookButton.setDisabled(true))
                            collector.stop();
                            return await i.update({
                                embeds: [embed],
                                components: [row]
                            })
                    }

                    //update fishing profile
                    data = await interaction.client.supabase
                        .rpc('set_last_fished', {
                            user_id_in: userId,
                            time_in: new Date().toISOString()
                        })

                    //update bait
                    await interaction.client.supabase
                        .rpc(`increment_tier${baitChoice}_bait`, {
                            amount_in: -1,
                            user_id_in: userId
                        })
                        
                }
            }
        })

    }
}

function checkIfAbleToFish(lastFished, fishingCooldown) {

    const lastWorkedMs = lastFished == null ? 0 : new Date(lastFished).getTime();

    //if not enough time has passed since last fish
    if (Date.now() - lastWorkedMs < fishingCooldown) {
        const timeLeft = fishingCooldown - (Date.now() - lastWorkedMs);
        const timeLeftMinutes = Math.floor(timeLeft / 60000);
        const timeLeftSeconds = ((timeLeft % 60000) / 1000).toFixed(0);

        return {
            ableToFish: false,
            timeLeft: `${timeLeftMinutes}:${timeLeftSeconds < 10 ? '0' : ''}${timeLeftSeconds}`
        }
    } else {
        return {
            ableToFish: true
        }
    }
}