const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { FishData, rarityInfo } = require('../../models/Fish')
const { getTieredCoins } = require('../../models/EconProfile');
const LootTable = require('loot-table');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        const baitSim = 1;

        let fish = require("../../data/fishdata")
        const lootTable = new LootTable();

        const totalFish = fish.length;

        const lootInfo = [{ rarity: "Common", percentage: fish.filter(x => x.rarity == 'Common').length / totalFish, multiplier: 6000 },
        { rarity: "Uncommon", percentage: fish.filter(x => x.rarity == 'Uncommon').length / totalFish, multiplier: 3000 }, { rarity: "Rare", percentage: fish.filter(x => x.rarity == 'Rare').length / totalFish, multiplier: 1000 },
        { rarity: "Epic", percentage: fish.filter(x => x.rarity == 'Epic').length / totalFish, multiplier: 500 }, { rarity: "Legendary", percentage: fish.filter(x => x.rarity == 'Legendary').length / totalFish, multiplier: 50 },
        { rarity: "Mythical", percentage: fish.filter(x => x.rarity == 'Mythical').length / totalFish, multiplier: 10 }
        ]


        for (let i = 0; i < fish.length; i++) {
            for (let k = 0; k < lootInfo.length; k++) {
                if (fish[i].rarity == lootInfo[k].rarity)
                    lootTable.add(fish[i], Math.ceil(lootInfo[k].percentage * lootInfo[k].multiplier))
            }
            //lootTable.add(fish[i], 5)
        }
        for (let i = 0; i < 100; i++) {
            console.log(lootTable.choose());
        }
    }

}
