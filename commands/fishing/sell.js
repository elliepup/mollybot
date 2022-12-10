const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sells a fish given its ID.')
        .addStringOption(option => option.setName('id').setDescription('The fish to sell.').setRequired(true)),
    async execute(interaction) {

        const identifier = interaction.options.getString('id');
        let { data, error } = await interaction.client.supabase
            .rpc('get_fish_by_id', {
                fish_id_in: identifier
            })

        //if error
        if (error) {
            return interaction.reply({
                content: "An error occurred while fetching the fish.",
                ephemeral: true,
            })
        }

        //if the fish is owned by the bot, say it doesn't exist
        if (data[0].current_owner == interaction.client.user.id) {
            return interaction.reply({
                content: "No fish with that ID was found.",
                ephemeral: true,
            })
        }
            

        //if no fish
        if (data.length == 0) {
            return interaction.reply({
                content: "No fish with that ID was found.",
                ephemeral: true,
            })
        }

        //if not owner
        if (data[0].current_owner != interaction.user.id) {
            return interaction.reply({
                content: "You can only sell fish that you own.",
                ephemeral: true,
            })
        }

        //if locked
        if (data[0].locked) {
            return interaction.reply({
                content: "You can only sell unlocked fish.",
                ephemeral: true,
            })
        }

        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✔')

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('✖')

        const rarityInfo = [
            { rarity: "Common", hex: "#919191", stars: "☆☆☆☆☆" }, { rarity: "Uncommon", hex: "#FFFFFF", stars: "★☆☆☆☆" }, { rarity: "Rare", hex: "#82FDFF", stars: "★★☆☆☆" },
            { rarity: "Epic", hex: "#6B00FD", stars: "★★★☆☆" }, { rarity: "Legendary", hex: "#FBFF00", stars: "★★★★☆" }, { rarity: "Mythical", hex: "#FF00E0", stars: "★★★★★" },
            { rarity: "Event", hex: "#03FC90", stars: "<a:CongratsWinnerConfetti:993186391628468244>" }
        ]

        const fish = data[0];
        const embed = new EmbedBuilder()
            .setColor('#bdbdbd')
            .setTitle('Sell Confirmation')
            .setDescription(`Are you sure you want to sell your **${data[0].name} \`${fish.fish_id_out}\`**? This action cannot be undone. You will receive **${getTieredCoins(data[0].value)}** for this fish.`)
            .setFields({ name: "Caught By", value: `<@${fish.original_owner}>`, inline: true },
                { name: "Caught On", value: `<t:${Math.floor((new Date(fish.caught_at).getTime()) / 1000)}>`, inline: true },
                { name: "Fish", value: (!fish.shiny) ? fish.name : `⭐${fish.name}⭐`, inline: true },
                { name: "Rarity", value: rarityInfo.find(obj => obj.rarity === fish.rarity).stars, inline: true },
                { name: "Value", value: getTieredCoins(fish.value), inline: true },
                { name: "Number", value: `\`${fish.number_caught}/${fish.total_caught}\``, inline: true },
                {
                    name: "Stats", value: `**Length:** ${(fish.fish_length > 24) ? `\`${(fish.fish_length / 12).toFixed(1)} ft\`` : `\`${fish.fish_length} in\``}` +
                        `\n**Weight:** \`${fish.fish_weight.toString()} lb\`\n**Color:** \`${fish.color}\`${(fish.shiny) ? `\n⭐**Shiny**⭐` : ""}`, inline: false
                },
            )
            .setThumbnail(`https://media.discordapp.net/attachments/1049015764830666843/${(!fish.shiny) ? fish.image.toString() : fish.image_shiny.toString()}/${fish.fish_number}.png`)
            .setFooter({ text: `Fish are purchased by Molly Bot for potential future events and activities.` })


        const row = new ActionRowBuilder()
            .addComponents(cancelButton, confirmButton)

        const message = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        })

        const filter = i => i.customId === 'confirm' || i.customId === 'cancel' && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            //after confirmation, make sure the fish is not locked and that the user owns it and that the fish is not already sold 

            row.setComponents(cancelButton.setDisabled(true), confirmButton.setDisabled(true))
            collector.stop();

            if (i.customId === 'cancel') {
                await i.update({
                    embeds: [embed
                        .setDescription('This transaction has been cancelled. The fish has not been sold.')
                        .setColor('#525252'),
                    ],
                    components: [row],
                })
            }

            if (i.customId === 'confirm') {
                //after confirmation, make sure the fish is not locked and that the user owns it and that the fish is not already sold 
                //get updated fish data to make sure it is not locked and that the user owns it and that the fish is not already sold

                let { data, error } = await interaction.client.supabase
                    .rpc('get_fish_by_id', {
                        fish_id_in: identifier
                    })


                //if error, update message and return 
                if (error) {
                    return await i.update({
                        embeds: [embed
                            .setDescription('There was an error selling your fish. Please try again later.')
                            .setColor('#ff0000'),
                        ],
                        components: [row],
                    })
                }

                //if locked
                if (data[0].locked) {
                    return await i.update({
                        embeds: [embed
                            .setDescription('This fish is locked and cannot be sold.')
                            .setColor('#ff0000'),
                        ],
                        components: [row],
                    })
                }

                //if not owned by user
                if (data[0].original_owner !== interaction.user.id) {
                    return await i.update({
                        embeds: [embed
                            .setDescription('You do not own this fish and cannot sell it.')
                            .setColor('#ff0000'),
                        ],
                        components: [row],
                    })
                }
                

                await i.update({
                    embeds: [embed
                        .setDescription(`You have successfully sold your **${data[0].name} \`${data[0].fish_id_out}\`** for **${getTieredCoins(data[0].value)}**.`)
                        .setColor('#a5ff75'),
                    ],
                    components: [row],
                })

                //update fish to now be owned by the bot
                await interaction.client.supabase
                .rpc('sell_fish_and_add_balance', {
                    fish_id_in: identifier,
                    user_id_in: interaction.user.id,
                })
            }


        });







    }
};