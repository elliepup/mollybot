import { Client, GatewayIntentBits } from 'discord.js';
import { CommandHandler } from './handlers/commandHandler';
import dotenv from 'dotenv';
import ready from './events/ready';

dotenv.config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const commandHandler = new CommandHandler(client);

client.once('ready', async () => {
    await commandHandler.loadCommands();
    await commandHandler.registerCommands();
    
    console.log(`Bot is online! Running in ${process.env.DEV_MODE === 'true' ? 'development' : 'production'} mode`);
    if (process.env.DEV_MODE === 'true' && process.env.GUILD_ID) {
        console.log(`Commands registered to guild: ${process.env.GUILD_ID}`);
    } else {
        console.log('Commands registered globally');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandHandler.getCommands().get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'There was an error executing this command!', 
            ephemeral: true 
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
