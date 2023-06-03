//initialize slash command
const { SlashCommandBuilder, EmbedBuilder, blockQuote, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for some coins!'),
    async execute(interaction) {

        //get economy_profile data from database
        let { data } = await interaction.client.supabase
            .rpc('get_economy_profile', {
                user_id_in: interaction.user.id
            });

        const workCooldown = 5 * 60 * 1000; //5 minutes
        const lastWorked = data.last_worked;

        //convert lastWorked to milliseconds from iso string
        const lastWorkedMs = lastWorked == null ? 0 : new Date(lastWorked).getTime();

        //check if user has worked in workCooldown time
        if (Date.now() - lastWorkedMs < workCooldown) {
            const timeLeft = workCooldown - (Date.now() - lastWorkedMs);
            const timeLeftMinutes = Math.floor(timeLeft / 60000);
            const timeLeftSeconds = ((timeLeft % 60000) / 1000).toFixed(0);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Unable to work`)
                        .setColor("#FF0000")
                        .setDescription(blockQuote(`You have already worked recently. Please wait \`${timeLeftMinutes}:${timeLeftSeconds < 10 ? '0' : ''}${timeLeftSeconds}\` before working again.`))
                        .addFields({ name: "Last worked", value: `<t:${Math.floor(lastWorkedMs / 1000)}>`, inline: true },
                            { name: "Cooldown", value: `<t:${Math.floor((lastWorkedMs + workCooldown) / 1000)}>`, inline: true })
                ]
            })
        }

        //create message buttons for jobs
        const gasStationButton = new ButtonBuilder()
            .setCustomId('gas_station')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⛽');
        const restaurantButton = new ButtonBuilder()
            .setCustomId('restaurant')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
            .setEmoji('🍔');
        const factoryButton = new ButtonBuilder()
            .setCustomId('factory')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
            .setEmoji('🏭')
        const farmButton = new ButtonBuilder()
            .setCustomId('farm')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
            .setEmoji('🌾');
        const constructionButton = new ButtonBuilder()
            .setCustomId('construction')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
            .setEmoji('🏗️');
        const officeButton = new ButtonBuilder()
            .setCustomId('office')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
            .setEmoji('🏢');
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
            .setEmoji('✖');

        //create message components
        const rowOne = new ActionRowBuilder()
            .addComponents(gasStationButton, restaurantButton, factoryButton);
        const rowTwo = new ActionRowBuilder()
            .addComponents(farmButton, constructionButton, officeButton);
        const rowThree = new ActionRowBuilder()
            .addComponents(cancelButton);

        const embed = new EmbedBuilder()
            .setTitle(`Work`)
            .setColor("#82E4FF")
            .setDescription(`Select a job to work at.`)
            .addFields({ name: "Gas Station", value: "Earn 5 to 10 silver pieces.", inline: true },
                { name: "Restaurant", value: "Earn 7 to 14 silver pieces.", inline: true },
                { name: "Factory", value: "Earn 10 to 20 silver pieces.", inline: true },
                { name: "Farm", value: "Earn 15 to 30 silver pieces.", inline: true },
                { name: "Construction", value: "Earn 20 to 40 silver pieces.", inline: true },
                { name: "Office", value: "Earn 30 to 60 silver pieces.", inline: true });

        //send message with buttons
        const msg = await interaction.reply({
            embeds: [embed],
            components: [rowOne, rowTwo, rowThree],
            fetchReply: true
        });

        //create collector for message buttons
        const filter = (button) => button.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        //handle button clicks
        collector.on('collect', async (button) => {
            //disable all buttons
            rowOne.components.forEach((button) => button.setDisabled(true));
            rowTwo.components.forEach((button) => button.setDisabled(true));
            rowThree.components.forEach((button) => button.setDisabled(true));
            //update message with disabled buttons
            await button.update({
                embeds: [embed],
                components: [rowOne, rowTwo, rowThree]
            });

            //eventually add more jobs

            //ensure user can work again in case they initiate another work command
            let { data } = await interaction.client.supabase
                .rpc('get_economy_profile', {
                    user_id_in: interaction.user.id
                });
            const lastWorked = data.last_worked;
            const lastWorkedMs = lastWorked == null ? 0 : new Date(lastWorked).getTime();
            if (Date.now() - lastWorkedMs < workCooldown) {
                const timeLeft = workCooldown - (Date.now() - lastWorkedMs);
                const timeLeftMinutes = Math.floor(timeLeft / 60000);
                const timeLeftSeconds = ((timeLeft % 60000) / 1000).toFixed(0);

                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Unable to work`)
                            .setColor("#FF0000")
                            .setDescription(blockQuote(`You have already worked recently. Please wait \`${timeLeftMinutes}:${timeLeftSeconds < 10 ? '0' : ''}${timeLeftSeconds}\` before working again.`))
                            .addFields({ name: "Last worked", value: `<t:${Math.floor(lastWorkedMs / 1000)}>`, inline: true },
                                { name: "Cooldown", value: `<t:${Math.floor((lastWorkedMs + workCooldown) / 1000)}>`, inline: true })
                    ]
                })
            }

            const coins = Math.floor(Math.random() * 500) + 500;

            //update database
            //update last_worked
            data = await interaction.client.supabase
                .rpc('update_player_for_working', {
                    added_balance_in: coins,
                    last_worked_in: new Date().toISOString(),
                    user_id_in: interaction.user.id
                })

            const nextWork = new Date(Date.now() + workCooldown);

            //edit message with new embed
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${interaction.user.username} worked at the ${button.customId.replace('_', ' ')}!`)
                        .setColor("#82E4FF")
                        .setDescription(blockQuote(`You worked at the ${button.customId.replace('_', ' ')} and earned ${getTieredCoins(coins)}!`))
                        .addFields({ name: "Next work", value: `<t:${Math.floor((nextWork) / 1000)}>`, inline: true }, { name: "Balance", value: `${getTieredCoins(data.data.balance)}`, inline: true })
                        .setFooter({ text: `The other jobs will be added at a later date.` })
                ],
                components: [rowOne, rowTwo, rowThree]
            });

            //stop collector
            collector.stop();

        })

        collector.on('end', async (reason) => {
            if (reason == 'time') {
                //disable buttons
                rowOne.components.forEach((button) => button.setDisabled(true));
                rowTwo.components.forEach((button) => button.setDisabled(true));
                rowThree.components.forEach((button) => button.setDisabled(true));
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Work`)
                            .setColor("#a6a6a6")
                            .setDescription(`You did not select a job in time. Please try again when you are ready. Please note that you only have 15 seconds to select a job.`)
                    ],
                    components: [rowOne, rowTwo, rowThree]
                });
            }
        })
    }
}
