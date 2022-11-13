module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {

        const client = interaction.client;
        const command = client.commands.get(interaction.commandName);

        if(interaction.isAutocomplete()) {
            const choices = client.commands.get(interaction.commandName).autocompleteOptions
            const focusedValue = interaction.options.getFocused();
            const filtered = choices.filter(choice => choice.startsWith(focusedValue));
            await interaction.respond(
                filtered.map(choice => ({name: choice, value: choice}))
            )
        }

        if (!interaction.isCommand()) return;

        if(!command) return;
        
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `An exception occurred upon execution. Please DM one of the developers, pseudolegendary nick#0021 or Nathan#5754 and provide as much detail as possible.`, 
                ephemeral: true
            });
        }
    }
}