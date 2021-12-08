const { SlashCommandBuilder, bold } = require('@discordjs/builders');
const { MessageButton, MessageActionRow, MessageEmbed } = require('discord.js');
const Users = require('../../models/Users')

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
        const userData = await Users.findOne({ userId: interaction.user.id }) || await Users.create({ userId: interaction.user.id });
        const balance = userData.balance;

        if (wager > balance) return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle('Insufficient funds')
                .setColor('FF1B1B')
                .setDescription(`The amount you wish to wager exceeds your total balance of \`${balance}\` <:YukiBronze:872106572275392512>.`)
            ]
        })

        if (wager < 1) return interaction.reply({
            embeds: [new MessageEmbed()
                .setTitle('Invalid wager')
                .setColor('FF1B1B')
                .setDescription(`You have to bet at least \`1\` <:YukiBronze:872106572275392512>.`)
            ]
        })

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

        interaction.reply({
            embeds: [embed],
            components: [row]
        })

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        }
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            max: 1,
        })

        collector.on("end", async (ButtonInteraction) => {

            const rngSim = (Math.floor(Math.random() * 2) == 0) ? 'heads' : 'tails';

            (row.components).forEach(element => { element.setDisabled(true) });
            const buttonId = (ButtonInteraction.first().customId);
            if (buttonId == 'cancel') return interaction.editReply({
                embeds: [embed
                    .setDescription(`The bet has been cancelled by ${interaction.user.username}. It was going to land on ${bold(rngSim)}.`)
                    .setColor('#3F3F3F')
                ],
                components: [row]
            })

            const rewardOrDeduction = (buttonId == rngSim) ? wager : (wager * -1);
            await userData.updateOne({$inc: {balance: rewardOrDeduction}});
            if (rewardOrDeduction > 0) {
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Congratulations! It landed on ${rngSim}, so you have won ${getTieredCoins(wager)}!`)
                        .addField("New balance", getTieredCoins(balance + rewardOrDeduction), true)
                        .setColor('4ADC00')
                    ],
                    components: [row]
                })
            } else {
                interaction.editReply({
                    embeds: [embed
                        .setDescription(`Ah, how unfortunate! It landed on ${rngSim}, so you have lost ${getTieredCoins(wager)}!`)
                        .addField("New balance", getTieredCoins(balance + rewardOrDeduction), true)
                        .setColor('DE0000')
                    ],
                    components: [row]
                })
            }

        })
    }
}

//please don't roast me up for how gross this is. I made this a long time ago and im too lazy to redo it since it works just fine
function getTieredCoins(balance) {
    const emotes = ['<:YukiPlat:872106609399169025>', '<:YukiGold:872106598527541248>',
        '<:YukiSilver:872106587861417994>', '<:YukiBronze:872106572275392512>']

    const platValue = 1000000,
        goldValue = 10000,
        silverValue = 100;

    const platinum = Math.floor(balance / platValue)
    const gold = Math.floor((balance - platinum * platValue) / goldValue)
    const silver = Math.floor((balance - platinum * platValue - gold * goldValue) / silverValue)
    const bronze = Math.floor((balance - platinum * platValue - gold * goldValue - silver * silverValue))

    const values = [platinum, gold, silver, bronze];

    var formattedString = "";
    for (let i = 0; i < values.length; i++) {
        if (values[i] != 0) formattedString += `\`${values[i]}\` ${emotes[i]} `
    }
    return formattedString;

}