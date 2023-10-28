import { Client, GatewayIntentBits } from "discord.js"
import { registerEvents } from "./utils/index"
import events from "./events/index"
import { config } from "./utils/config"

//create a new client
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

//register the events
registerEvents(client, events)

//login
client.login(config.token)
.catch((err) => {
    console.error("Failed to login: ", err)
    process.exit(1)
})