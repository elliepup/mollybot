const Users = require("../../models/Users")

module.exports = {
name: 'balance',
description: 'Shows the balance or target.',
args: false,
async execute(message, args) {
    const discord = require('discord.js')
    const target = (message.mentions.users.first()) ? message.mentions.users.first() : message.author;
    let userData = await Users.findOne({userID: target.id})
    let balance;
    if(!userData) {
        createUserData(target.id)
        balance = 0;
    } else { balance = userData.balance}

    const embed = new discord.MessageEmbed()
    .setColor("#20FC00")
    .setTitle(`${target.username}'s balance`)
    .setDescription(`${getTieredCoins(balance)} \n\`${balance}\` <:YukiBronze:872106572275392512> in total.`)
    .setFooter('There is currently no way to gain or spend coins because I am likely going to remove this feature as I only implemented it for testing purposes.')
    message.channel.send(embed)
    
    
},
};

const createUserData = (userID) => {
Users.create({userID: userID})
}

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