const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const buttonPagination = require('../../functions/pagination.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('collection')
        .setDescription('Displays the collection of fish you or another user has.')
        .addUserOption(option => option.setName('user').setDescription('The user to view the collection of.').setRequired(false)),
    async execute(interaction) {

        const target = interaction.options.getUser('user') || interaction.user;

        const { data, error } = await interaction.client.supabase
            .rpc('get_fish_by_owner', {
                user_id_in: target.id
            })

        if (error) {
            return interaction.reply({
                content: `There was an error retrieving the fish!`,
                ephemeral: true
            })
        }

        if (data.length === 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FC0000')
                        .setTitle("<:yukinon:839338263214030859> No fish in collection")
                        .setDescription(`${target.username} currently has no fish. In order to get fish, use the /fish command.`)
                ]
            })
        }

        const fishValueTotal = data.reduce((acc, fish) => acc + fish.value, 0);

        const pages = [];
        const buttons = [];
        const maxFishPerPage = 8;
        const timeout = 300000;

        const rarityInfo = [
            { rarity: "Common", hex: "#919191", stars: "☆☆☆☆☆" }, { rarity: "Uncommon", hex: "#FFFFFF", stars: "★☆☆☆☆" }, { rarity: "Rare", hex: "#82FDFF", stars: "★★☆☆☆" },
            { rarity: "Epic", hex: "#6B00FD", stars: "★★★☆☆" }, { rarity: "Legendary", hex: "#FBFF00", stars: "★★★★☆" }, { rarity: "Mythical", hex: "#FF00E0", stars: "★★★★★" },
            { rarity: "Event", hex: "#03FC90", stars: "<a:CongratsWinnerConfetti:993186391628468244>" }
          ]

        for (let i = 0; i < data.length; i += maxFishPerPage) {
            const current = data.slice(i, maxFishPerPage + i);
            const j = i;
            pages.push(new EmbedBuilder()
                .setColor('#03fc84')
                .setTitle(`🐟🐠🐡Fish Collection🐟🐠🐡`)
                .setDescription(`Fish carried by <@${target.id}>`)
                .setFields({name: `Collection Value: ${getTieredCoins(fishValueTotal)}`, value: 
                current.map((fish, i) => {
                    let output = "";
                    output += (fish.locked) ? "🔒" : "🔓"; //locked or unlocked
                    output += `\`${fish.fish_id_out}\` · ` //fish id in code block
                    output += `\`${rarityInfo.find(rarity => rarity.rarity === fish.rarity).stars}\` · `; //rarity stars
                    output += ('`'+ ((fish.fish_length > 24) ? (fish.fish_length/12).toFixed(1) + " ft      " : fish.fish_length + " in    ")).substring(0,7) + '` · '; //length
                    output += ('`'+ ((fish.fish_weight > 4000) ? (fish.fish_weight/2000).toFixed(1) + " tons " : fish.fish_weight + " lb     ")).substring(0,9) + '` · '; //weight
                    output += '`' + ((fish.value > 1000) ? `${(fish.value/1000).toFixed(1)}k    ` : `${fish.value}     `).substring(0,6) + '`' + `<:YukiBronze:872106572275392512> · `; //value
                    output += '`' + (fish.name) + '`'; //name

                    return output;
                }).join('\n')})
                .setFooter({text: `Sorting options coming soon!`})
            );
        }

        buttonPagination(interaction, pages);


    }
}