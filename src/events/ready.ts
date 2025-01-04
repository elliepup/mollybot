import { Client } from 'discord.js';

export default (client: Client) => {
    client.once('ready', () => {
        console.log('Bot is online!');
    });
};
