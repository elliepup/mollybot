import { Client, Collection, REST, Routes } from 'discord.js';
import { Command } from '../interfaces/Command';
import fs from 'fs';
import path from 'path';

export class CommandHandler {
    private commands = new Collection<string, Command>();
    private client: Client;
    private readonly devMode: boolean;
    private readonly guildId?: string;

    constructor(client: Client) {
        this.client = client;
        this.devMode = process.env.DEV_MODE === 'true';
        this.guildId = process.env.GUILD_ID;
    }

    async loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        // Check if we're running from compiled code or source
        const fileExtension = __filename.endsWith('.ts') ? '.ts' : '.js';
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(fileExtension));

        console.log(`Looking for *${fileExtension} files in: ${commandsPath}`);
        console.log(`Found ${commandFiles.length} command files`);

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                // Clear require cache in development
                if (this.devMode) {
                    delete require.cache[require.resolve(filePath)];
                }
                
                const command = require(filePath).default as Command;
                
                if ('data' in command && 'execute' in command) {
                    this.commands.set(command.data.name, command);
                    console.log(`Loaded command: ${command.data.name}`);
                } else {
                    console.log(`Failed to load command from ${file}: missing required properties`);
                }
            } catch (error) {
                console.error(`Error loading command from ${file}:`, error);
            }
        }

        console.log(`Successfully loaded ${this.commands.size} commands`);
    }

    async registerCommands() {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
        const commandsData = Array.from(this.commands.values()).map(command => command.data.toJSON());

        try {
            console.log(`Started refreshing ${commandsData.length} application (/) commands.`);

            if (this.devMode && this.guildId) {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID!, this.guildId),
                    { body: commandsData },
                );
                console.log(`Successfully registered ${commandsData.length} commands to guild ${this.guildId}`);
            } else {
                await rest.put(
                    Routes.applicationCommands(process.env.CLIENT_ID!),
                    { body: commandsData },
                );
                console.log(`Successfully registered ${commandsData.length} global commands`);
            }

            const registeredCommands = await rest.get(
                this.devMode && this.guildId
                    ? Routes.applicationGuildCommands(process.env.CLIENT_ID!, this.guildId)
                    : Routes.applicationCommands(process.env.CLIENT_ID!)
            ) as any[];

            console.log(`Verified ${registeredCommands.length} commands are registered on Discord`);
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }

    getCommands() {
        return this.commands;
    }
}
