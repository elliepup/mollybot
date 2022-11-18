//Molly Bot [Revamped] -Rewritten
//Nicholas, Nathan Tabb
//Started 11/12/2022
//Molly Bot [Revamped], but music commands will hopefully not break randomly again

require('dotenv').config();
const fs = require('node:fs');

const discord = require('discord.js');
const { Player } = require('discord-player')

//client object with intents
const client = new discord.Client({
    intents: ["Guilds", "GuildVoiceStates", "GuildMessages", "MessageContent"]
});

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

//function handling
const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));
for (const file of functions) {
    require(`../functions/${file}`)(client);
}


client.login(process.env.TOKEN);