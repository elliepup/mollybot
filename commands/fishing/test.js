const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../../models/User');
const { FishData } = require('../../models/Fish');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        await FishData.updateMany({}, { $set: { locked: false } });
        
        
        

    }
}