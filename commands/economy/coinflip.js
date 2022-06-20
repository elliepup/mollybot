const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed, ButtonInteraction } = require('discord.js');
const { EconData, getTieredCoins } = require('../../models/EconProfile')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription(`Risk some coins on a single coinflip.`)
        .addIntegerOption(option =>
            option.setName('wager')
                .setDescription('The amount you wish to wager.')
                .setRequired(true)),
    async execute(interaction) {

        const wager = interaction.options.getInteger("wager");
        let userData = await EconData.findOne({ userId: interaction.user.id }) || await EconData.create({ userId: interaction.user.id });
        const balance = userData.balance;

        //if the user attempts to wager a value less than 1
        if (wager > balance) return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle('Insufficient funds')
                    .setColor('FF1B1B')
                    .setDescription(`The amount you wish to wager exceeds your total balance of \`${balance}\` <:YukiBronze:872106572275392512>.`)
            ]
        })

        //if the amount the user wishes to wager exceeds their balance
        if (wager < 1) return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle('Invalid wager')
                .setColor('FF1B1B')
                .setDescription(`You have to bet at least \`1\` <:YukiBronze:872106572275392512>.`)
            ]
        })

        //buttons for embeds
        const headsButton = new MessageButton()
            .setLabel("Heads")
            .setEmoji('<:Heads:913540273932501032>')
            .setStyle("PRIMARY")
            .setCustomId("heads")
        const tailsButton = new MessageButton()
            .setLabel("Tails")
            .setStyle("SECONDARY")
            .setEmoji('<:Tails:913540299656159312>')
            .setCustomId("tails")
        const cancelButton = new MessageButton()
            .setLabel("Cancel")
            .setStyle("DANGER")
            .setCustomId('cancel')
        const row = new MessageActionRow().addComponents(headsButton, tailsButton, cancelButton)

        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username} has initiated a coinflip!`)
            .setDescription('Please select heads or tails. Alternatively, you can cancel the bet if you got cold feet.')
            .addField(`Wager`, `${getTieredCoins(wager)}`, true)
            .setColor('E1E1E1');

        //sending the buttons on the row to the user along with the embed above
        interaction.reply({
            embeds: [embed],
            components: [row]
        })

        //fetching the message of the interaction reply to create an interaction collector on that specific message
        const message = await interaction.fetchReply();

        //user specific filter; only the person who initiated the interaction can react
        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        }

        //collector on message with filter and a maximum of one interaction
        const collector = message.createMessageComponentCollector({
            filter,
            max: 1,
        })

        //when the user clicks, ending the collector because it has a maximum of one interaction
        collector.on('end', async (buttonInteraction) => {
            //begin RNG sim and life ruiner
            const rngSim = (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';

            //set buttons to disabled
            (row.components).forEach(element => { element.setDisabled(true) });
            const buttonId = (buttonInteraction.first().customId);

            userData = await EconData.findOne({ userId: interaction.user.id })

            //if the button pressed was the cancel button, cancel bet and edit embed
            if (buttonId == 'cancel') return interaction.editReply({
                embeds: [embed
                    .setDescription(`The bet has been cancelled by ${interaction.user.username}. It was going to land on ${bold(rngSim)}.`)
                    .setColor('#3F3F3F')
                ],
                components: [row]
            })

            if(userData.balance < wager) return interaction.editReply({
                embeds: [embed
                    .setDescription(`The amount you wish to coinflip exceeds your current balance.`)
                    .setColor('#FC0000')
                ],
                components: [row]
            })

            //generate and update balance
            const rewardOrDeduction = (buttonId == rngSim) ? wager : (wager * -1);
            await userData.updateOne({ $inc: { balance: rewardOrDeduction, timesCoinflipped: 1, totalCoinflipped: wager } })

            if (wager > userData.biggestCoinflip) {
                await userData.updateOne({ $set: { biggestCoinflip: wager } })
            }

            //if the user has won
            if (rewardOrDeduction > 0) {
                await userData.updateOne({ $inc: { winningsFromCoinflips: wager, coinflipsWon: 1 } })
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Congratulations! It landed on ${rngSim}, so you have won ${getTieredCoins(wager)}!`)
                        .addField("New balance", getTieredCoins(balance + rewardOrDeduction), true)
                        .setColor('4ADC00')
                    ],
                    components: [row]
                })
            } else { //if they have lost
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Ah, how unfortunate! It landed on ${rngSim}, so you have lost ${getTieredCoins(wager)}!`)
                        .addField("New balance", (getTieredCoins(balance + rewardOrDeduction)) || '`0` <:YukiBronze:872106572275392512>', true)
                        .setColor('DE0000')
                    ],
                    components: [row]
                })
            }
        })
    },
}