import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../interfaces/Command';

const ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    }
};

export default ping;
