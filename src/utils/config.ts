import dotenv from "dotenv"
dotenv.config()
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env

//if any of the above are undefined, throw an error
if (!CLIENT_ID || !GUILD_ID || !DISCORD_TOKEN) {
    throw new Error("Missing environment variables")
}

//export the config object
export const config: Record<string, string> = {
    clientId: CLIENT_ID,
    guildId: GUILD_ID,
    token: DISCORD_TOKEN,
}

export default config