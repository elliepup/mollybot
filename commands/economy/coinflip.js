const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const { getTieredCoins, getBalance, updateBalance, updateEconAttribute } = require('../../extras/econFunctions')
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

        //if the user attempts to wager a value less than 1
        if (wager < 1) {
            return interaction.reply({
                embeds: [new MessageEmbed()
                    .setTitle('Invalid wager')
                    .setColor('FF1B1B')
                    .setDescription(`You have to bet at least \`1\` <:YukiBronze:872106572275392512>.`)
                ]
            })
        }

        //if the amount the user wishes to wager exceeds their balance
        const balance = await getBalance(interaction.user.id);
        if (balance < wager) {
            return interaction.reply({
                embeds: [new MessageEmbed()
                    .setTitle('Insufficient funds')
                    .setColor('FF1B1B')
                    .setDescription(`The amount you wish to wager exceeds your total balance of \`${balance}\` <:YukiBronze:872106572275392512>.`)
                ]
            })
        }

        //buttons for heads, tails, and cancel
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
        });

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

            //if the button pressed was the cancel button, cancel bet and edit embed
            if (buttonId == 'cancel') return interaction.editReply({
                embeds: [embed
                    .setDescription(`The bet has been cancelled by ${interaction.user.username}. It was going to land on ${bold(rngSim)}.`)
                    .setColor('#3F3F3F')
                ],
                components: [row]
            })

            const rewardOrDeduction = (buttonId == rngSim) ? wager : (wager * -1);
            await updateBalance(interaction.user.id, rewardOrDeduction);

            await updateEconAttribute(interaction.user.id, "timesCoinflipped", 1)
            await updateEconAttribute(interaction.user.id, "totalCoinflipped", wager);
            if (rewardOrDeduction > 0) {
                await updateEconAttribute(interaction.user.id, "winningsFromCoinflips", wager);
                await updateEconAttribute(interaction.user.id, "coinflipsWon", 1);
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Congratulations! It landed on ${rngSim}, so you have won ${getTieredCoins(wager)}!`)
                        .addField("New balance", getTieredCoins(balance + rewardOrDeduction), true)
                        .setColor('4ADC00')
                    ],
                    components: [row]
                })
            } else {
                await updateEconAttribute(interaction.user.id, "coinflipsLost", 1)
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Ah, how unfortunate! It landed on ${rngSim}, so you have lost ${getTieredCoins(wager)}!`)
                        .addField("New balance", (getTieredCoins(balance + rewardOrDeduction)) || '`0` <:YukiBronze:872106572275392512>', true)
                        .setColor('DE0000')
                    ],
                    components: [row]
                })
            }
        });

        
    }
}
