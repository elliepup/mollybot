import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import ready from './events/ready';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

ready(client);

client.login(process.env.DISCORD_TOKEN);
