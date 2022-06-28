const mongoose = require('mongoose')

const econProfile = new mongoose.Schema({
    userId: {type: String, require: true, unique: true},
    balance: {type: Number, default: 100},
    workCooldown: {type: Date, default: null},
    totalCoinflipped: {type: Number, default: 0},
    timesCoinflipped: {type: Number, default: 0},
    coinflipsWon: {type: Number, default: 0},
    biggestCoinflip: {type: Number, default: 0},
    winningsFromCoinflips: {type: Number, default: 0},
    totalDonated: {type: Number, default: 0},
    totalWorked: {type: Number, default: 0},
    timesWorked: {type: Number, default: 0},
})

const EconData = mongoose.model("EconProfile", econProfile);

// :)
function getTieredCoins(n) {
    const diamond = Math.floor(n / 100000000)
    const platinum = Math.floor(n % 100000000 / 1000000);
    const gold = Math.floor((n % 1000000) / 10000);
    const silver = Math.floor((n % 10000) / 100);
    const bronze = n % 100;
    const coinArr = [diamond, platinum, gold, silver, bronze];
    const coinEmotes = ['<:YukiDiamond:991180473478938644>', '<:YukiPlat:872106609399169025>', '<:YukiGold:872106598527541248>',
        '<:YukiSilver:872106587861417994>', '<:YukiBronze:872106572275392512>'];
    let formattedString = "";
    for (let i = 0; i < coinArr.length; i++) {
        formattedString += (coinArr[i] != 0) ? `\`${coinArr[i]}\` ${coinEmotes[i]} ` : ""
    }
    return formattedString || "`0` <:YukiBronze:872106572275392512>";
}


module.exports = { EconData, getTieredCoins };