const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, blockQuote, codeBlock } = require('discord.js');
const { getTieredCoins } = require('../../functions/data/economy.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('Donate coins to another user.')
        .addUserOption(option => option.setName('user').setDescription('The user to donate to.').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('The amount of coins to donate.').setRequired(true)),
    async execute(interaction) {

        //if the user is donating to themselves send ephemeral message
        if (interaction.options.getUser('user').id === interaction.user.id) {
            return interaction.reply({
                content: `You can't donate to yourself!`,
                ephemeral: true
            })
        }

        //if is donating an amount less than 1 send ephemeral message
        if (interaction.options.getInteger('amount') < 1) {
            return interaction.reply({
                content: `You can't donate less than 1 coin!`,
                ephemeral: true
            })
        }

        const user = interaction.options.getUser('user')
        const { data } = await interaction.client.supabase
            .rpc('get_balance', {
                user_id_in: interaction.user.id
            })

        const amount = interaction.options.getInteger('amount');

        //if the user is donating more than they have send ephemeral message
        if (amount > data) {
            return interaction.reply({
                content: `You don't have enough coins to donate that amount!`,
                ephemeral: true
            })
        }

        //create confirm and cancel buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setEmoji('✔')
            .setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setEmoji('✖')
            .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username} is about to donate to ${user.username}`)
            .setColor("#82E4FF")
            .setDescription(`${blockQuote(`You are about to donate ${getTieredCoins(amount)} to ${user.username}. This action cannot be undone. Please confirm or cancel.`)}`)
            .setFooter({ text: `You can earn coins by using the /work command.`, iconURL: user.displayAvatarURL() })

        //send embed and fetch message
        const msg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        })

        //create collector
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel' && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
        
        collector.on('collect', async i => {

            row.components.forEach((button) => button.setDisabled(true));
            //if the user clicks confirm
            if (i.customId === 'confirm') {

                //confirm user still has enough coins
                let { data } = await interaction.client.supabase
                    .rpc('get_balance', {
                        user_id_in: interaction.user.id
                    })

                //if the user doesn't have enough coins, update the embed and send it
                if (amount > data) {
                    embed.setDescription(`${blockQuote(`You no longer have enough coins to donate ${getTieredCoins(amount)} to ${user.username}.`)}`)
                    return i.update({
                        embeds: [embed],
                        components: [row]
                    })
                }

                //update the balance of the user who sent the command
                
                let donorBalance, receiverBalance;
                 data = await interaction.client.supabase
                    .rpc('add_player_balance', {
                        user_id_in: interaction.user.id,
                        amount_in: -amount})

                donorBalance = data.data.balance;

                //update the balance of the user who is receiving the donation
                 data = await interaction.client.supabase
                    .rpc('add_player_balance', {
                        user_id_in: user.id,
                        amount_in: amount})

                receiverBalance = data.data.balance;


                //update the embed and send it
                embed.setDescription(`${blockQuote(`You have successfully donated ${getTieredCoins(amount)} to ${user.username}.`)}`)
                embed.addFields({ name: `${interaction.user.username}'s Balance`, value: `${getTieredCoins(donorBalance)}`, inline: true }, { name: `${user.username}'s Balance`, value: `${getTieredCoins(receiverBalance)}`, inline: true })
                
                i.update({
                    embeds: [embed],
                    components: [row]
                })
                
                return;
            }

            //if the user clicks cancel
            if (i.customId === 'cancel') {
                //edit the embed to say the donation was cancelled
                embed.setDescription(`${blockQuote(`The donation was cancelled. No coins were taken from your wallet.`)}`)
                return i.update({
                    embeds: [embed],
                    components: [row]
                })
            }

            //stop the collector
            collector.stop();
        }
        )

        collector.on('end', collected => {
            //if the collector ended because of time
            if (collected.size === 0) {
                //edit the embed to say the donation was cancelled
                row.components.forEach((button) => button.setDisabled(true));
                embed.setDescription(`${blockQuote(`The donation was cancelled. No coins were taken from your wallet.`)}`)
                return interaction.editReply({
                    embeds: [embed],
                    components: [row]
                })
            }
        })
    }
}