const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Users = require('../../models/Users')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription(`Displays the balance of the target.`)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The person whose balance you want to see. (Optional)')
                .setRequired(false)),
    async execute(interaction) {
            const target = interaction.options.getUser('target') || interaction.member.user;

            //find user and create data if it does not exist
            let userData = await Users.findOne({userId: target.id});
            if(!userData) {
                await Users.create({userId: target.id}).then((newData) => userData = newData)
            }
            
            const balance = userData.balance;
            const embed = new MessageEmbed()
            .setTitle(`${target.username}'s balance`)
            .setColor("#20FC00")
            .setDescription(`${getTieredCoins(balance)}\n\`${balance}\` <:YukiBronze:872106572275392512> in total.`)
            .setFooter(`Coins current serve no purpose. This was mainly added to test a new database I've been experimenting with.`)
            
            interaction.reply({ embeds: [embed] })
    }
}

//function was created early in my programming career. despite looking absolutely disgusting, it works perfectly fine :) 
function getTieredCoins(balance) {
    const emotes = ['<:YukiPlat:872106609399169025>','<:YukiGold:872106598527541248>',
                    '<:YukiSilver:872106587861417994>','<:YukiBronze:872106572275392512>']
    
    const platValue = 1000000,
    goldValue = 10000,
    silverValue = 100;
    
    const platinum = Math.floor(balance/platValue)
    const gold = Math.floor((balance - platinum * platValue)/goldValue)
    const silver = Math.floor((balance - platinum * platValue - gold * goldValue)/silverValue)
    const bronze = Math.floor((balance - platinum * platValue - gold * goldValue - silver * silverValue))
    
    const values = [platinum, gold, silver, bronze];
    
    var formattedString = "";
    for(let i = 0; i < values.length; i++) {
        if(values[i] != 0) formattedString += `\`${values[i]}\` ${emotes[i]} `
    }
    return formattedString;
    
    }