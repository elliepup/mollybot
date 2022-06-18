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
    timesWorked: {type: Number, default: 0}

})

const EconData = mongoose.model("EconProfile", econProfile);

//:vomit:
const getTieredCoins = (coins) => {
    //just in case I decide to change the values later on. goes from silver to plat
    if(!coins) return "`0` <:YukiBronze:872106572275392512>";
    const coinValues = [100, 100, 100];
    const coinEmotes = ['<:YukiPlat:872106609399169025>', '<:YukiGold:872106598527541248>',
        '<:YukiSilver:872106587861417994>', '<:YukiBronze:872106572275392512>'];
    let remainingCoins = coins;
    const platinum = Math.floor(remainingCoins / (coinValues[0] * coinValues[1] * coinValues[2]));
    remainingCoins -= (platinum * coinValues[0] * coinValues[1] * coinValues[2]);
    const gold = Math.floor(remainingCoins / (coinValues[0] * coinValues[1]));
    remainingCoins -= (gold * coinValues[0] * coinValues[1]);
    const silver = Math.floor(remainingCoins / (coinValues[0]));
    const bronze = remainingCoins - (silver * coinValues[0]);

    const coinArr = [platinum, gold, silver, bronze];
    let formattedString = "";
    for(let i = 0; i < coinArr.length; i++) {
        formattedString += (coinArr[i] != 0) ? `\`${coinArr[i]}\` ${coinEmotes[i]} ` : ""
    }
    return formattedString || "`0` <:YukiBronze:872106572275392512>";
}

module.exports = { EconData, getTieredCoins };