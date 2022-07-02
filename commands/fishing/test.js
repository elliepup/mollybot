const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../models/User');
const { FishData } = require('../../models/Fish');
const FishingData  = require('../../models/FishingProfile');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {


        //await FishingData.updateMany({}, { $set: { fishingLog: [] } });
        
        //await FishData.updateOne({ name: "Tier 5 Bait" }, { $inc: { quantity: 1 } });

    }
}