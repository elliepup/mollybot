const { SlashCommandBuilder, bold, quote } = require('@discordjs/builders');
const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription(`Command for testing purposes.`),
    async execute(interaction) {

        

    }
}