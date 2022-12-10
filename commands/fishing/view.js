const { SlashCommandBuilder, EmbedBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view')
        .setDescription('Displays the fish given the unique ID.')
        .addStringOption(option => option.setName('id').setDescription('The unique ID of the fish.').setRequired(true)),
    async execute(interaction) {

        const targetFish = interaction.options.getString('id');

        //if targetfish is not 6 characters long send ephemeral message
        if (targetFish.length !== 6) {
            return interaction.reply({
                content: `That is not a valid fish ID!`,
                ephemeral: true
            })
        }           

        const { data, error } = await interaction.client.supabase
            .rpc('get_fish_by_id', {
                fish_id_in: targetFish
            })

        //if error for some reason send ephemeral message
        if (error) {
            return interaction.reply({
                content: `There was an error retrieving the fish!`,
                ephemeral: true
            })
        }

        //if the bot is currently owned by the bot say it doesn't exist
        if (data[0].current_owner === interaction.client.user.id) {
            return interaction.reply({
                content: `I was unable to find a fish with the ID \`${targetFish}\`. Please ensure you have the correct ID then try again.`,
                ephemeral: true
            })
        }

        //if no fish is found send ephemeral message
        if (data.length === 0) {
            return interaction.reply({
                content: `I was unable to find a fish with the ID \`${targetFish}\`. Please ensure you have the correct ID then try again.`,
                ephemeral: true
            })
        }

        const fish = data[0];

        //rarityinfo
        const rarityInfo = [
            { rarity: "Common", hex: "#919191", stars: "☆☆☆☆☆" }, { rarity: "Uncommon", hex: "#FFFFFF", stars: "★☆☆☆☆" }, { rarity: "Rare", hex: "#82FDFF", stars: "★★☆☆☆" },
            { rarity: "Epic", hex: "#6B00FD", stars: "★★★☆☆" }, { rarity: "Legendary", hex: "#FBFF00", stars: "★★★★☆" }, { rarity: "Mythical", hex: "#FF00E0", stars: "★★★★★" },
            { rarity: "Event", hex: "#03FC90", stars: "<a:CongratsWinnerConfetti:993186391628468244>" }
        ]

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Fish Details: \`${fish.fish_id_out}\``)
                    .setColor((!fish.shiny) ? rarityInfo.find(obj => obj.rarity === fish.rarity).hex : `#FFD700`)
                    .setThumbnail((!fish.shiny) ? `https://media.discordapp.net/attachments/1049015764830666843/${fish.image.toString()}/${fish.fish_number}.png` : `https://media.discordapp.net/attachments/1049018284298752080/${fish.image_shiny.toString()}/${fish.fish_number}.png`)
                    .setDescription(`Current Owner: <@${fish.current_owner}>`)
                    .addFields({ name: "Caught By", value: `<@${fish.original_owner}>`, inline: true },
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
                    .setFooter({ text: `This feature is still in development. If you have any suggestions, please DM me!` })


            ]
        })

    }
}