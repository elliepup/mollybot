module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        if (!interaction.isCommand()) return;

        const client = interaction.client;
        const command = client.commands.get(interaction.commandName);

        if(!command) return;
        
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({content: `An exception occurred upon execution. DM pseudolegendary nick#0021 with the error, but he probably already knows.`, ephemeral: true});
        }
    }
}