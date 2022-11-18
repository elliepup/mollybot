const discord = require('discord.js');

async function buttonPagination(interaction, embeds, timeout = 120000) {

    await interaction.deferReply();

    //if only one embed, no need for pagination, just send the embed
    if (embeds.length === 1) {
        return interaction.editReply({ embeds: [embeds[0]], fetchReply: true });
    }

    //if more than one embed, create the buttons 
    const previousButton = new discord.ButtonBuilder()
        .setCustomId('previous')
        .setLabel('⏪')
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(true);
    const homeButton = new discord.ButtonBuilder()
        .setCustomId('home')
        .setLabel('🏠')
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(true);
    const nextButton = new discord.ButtonBuilder()
        .setCustomId('next')
        .setLabel('⏩')
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(false);
    const startButton = new discord.ButtonBuilder()
        .setCustomId('start')
        .setLabel('⏮')
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(true);
    const endButton = new discord.ButtonBuilder()
        .setCustomId('end')
        .setLabel('⏭')
        .setStyle(discord.ButtonStyle.Secondary)
        .setDisabled(false);

    const row = new discord.ActionRowBuilder()
        .addComponents(startButton, previousButton, homeButton, nextButton, endButton);

    //send the first embed at index 0
    let currentPage = 0;
    const msg = await interaction.editReply({ embeds: [embeds[currentPage]], components: [row], fetchReply: true });

    //create a collector for the buttons and listen for button presses by the user who sent the command
    const filter = (button) => button.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: timeout });

    collector.on('collect', async (button) => {
            
            //set footer to current page
    
            //if the button pressed is the previous button
            if (button.customId === 'previous') {
                currentPage--;
                if (currentPage === 0) {
                    previousButton.setDisabled(true);
                    homeButton.setDisabled(true);
                    startButton.setDisabled(true);
                    nextButton.setDisabled(false);
                    endButton.setDisabled(false);
                } else {
                    previousButton.setDisabled(false);
                    homeButton.setDisabled(false);
                    startButton.setDisabled(false);
                    nextButton.setDisabled(false);
                    endButton.setDisabled(false);
                }
            }
            //if the button pressed is the next button
            if (button.customId === 'next') {
                currentPage++;
                if (currentPage === embeds.length - 1) {
                    previousButton.setDisabled(false);
                    homeButton.setDisabled(false);
                    startButton.setDisabled(false);
                    nextButton.setDisabled(true);
                    endButton.setDisabled(true);
                } else {
                    previousButton.setDisabled(false);
                    homeButton.setDisabled(false);
                    startButton.setDisabled(false);
                    nextButton.setDisabled(false);
                    endButton.setDisabled(false);
                }
            }
            //if the button pressed is the home button
            if (button.customId === 'home') {
                currentPage = 0;
                previousButton.setDisabled(true);
                homeButton.setDisabled(true);
                startButton.setDisabled(true);
                nextButton.setDisabled(false);
                endButton.setDisabled(false);
            }
            //if the button pressed is the start button
            if (button.customId === 'start') {
                currentPage = 0;
                previousButton.setDisabled(true);
                homeButton.setDisabled(true);
                startButton.setDisabled(true);
                nextButton.setDisabled(false);
                endButton.setDisabled(false);
            }
            //if the button pressed is the end button
            if (button.customId === 'end') {
                currentPage = embeds.length - 1;
                previousButton.setDisabled(false);
                homeButton.setDisabled(false);
                startButton.setDisabled(false);
                nextButton.setDisabled(true);
                endButton.setDisabled(true);
            }
    
            //edit the message with the new embed
            await button.update({ embeds: [embeds[currentPage]], components: [row] });
        });
    
    
}

module.exports = buttonPagination;