const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../models/User');
const { FishData } = require('../../models/Fish');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        await FishData.updateMany({}, { $set: { locked: false } });
        
        await FishData.updateOne({ name: "Tier 5 Bait" }, { $inc: { quantity: 1 } });

    }
}