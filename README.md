# MollyBot

MollyBot is a multipurpose Discord bot written in JavaScript with the [Node.js](https://nodejs.org/) framework. It offers a variety of features for your Discord server, including music commands, economy commands, and fishing commands.

## Music Commands

MollyBot can play music in a voice channel on your Discord server. Simply use the `/play` command followed by a YouTube link to queue a song. Use the `/skip` command to skip to the next song in the queue.

## Economy Commands

MollyBot includes an economy system where users can buy, sell, donate, and even gamble. Use the `/coinflip` command to try gambling out. Or you could try out the `/leaderboard` command to see where you stand!

## Fishing Commands

MollyBot includes a fishing mini-game with over 100 unique fish to catch, each with varying rarities and times to be caught. Use the `/fish` command to start fishing, and see what you can catch!

## Additional Commands

For a full list of commands, use the `/help` command.

## Setting Up MollyBot

To set up and run MollyBot on your own server, follow these steps:

1. Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/).
2. Clone this repository to your local machine.
3. Run `npm install` to install the necessary dependencies.
4. Create a new application and bot on the [Discord Developer Portal](https://discord.com/developers/applications).
5. Create a `.env` file in the root directory and add your bot's token and prefix like this:
`BOT_TOKEN=your_bot_token`
`PREFIX=your_prefix`
6. Run `npm start` to start the bot.

## Contributing

We welcome contributions to MollyBot! If you have an idea for a new feature or have found a bug, please open an issue or submit a pull request.
