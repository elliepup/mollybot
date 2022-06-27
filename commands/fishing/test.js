const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('A command for testing purposes'),
    async execute(interaction) {

        
    }
}