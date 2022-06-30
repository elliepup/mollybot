const { SlashCommandBuilder } = require('@discordjs/builders');
const { LotteryEntry } = require('../../models/LotteryEntry');
const LootTable = require('loot-table');
const { User } = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        const entries = await LotteryEntry.find({});
        const lootTable = new LootTable();
        for(entry of entries) {
            lootTable.add(entry.user, entry.tickets);
        }

        const winner = lootTable.choose();
        const winnerUser = await User.findById(winner);

    }
}