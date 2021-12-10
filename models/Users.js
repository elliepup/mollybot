const mongoose = require('mongoose')

const UserData = new mongoose.Schema({
    userId: {type: String, require: true, unique: true},
    balance: {type: Number, default: 100},
    songsPlayed: {type: Number, default: 0},
    songsSkipped: {type: Number, default: 0},
    songsRemoved: {type: Number, default: 0},
    queuesStopped: {type: Number, default: 0},
    timesPaused: {type: Number, default: 0},
    timesResumed: {type: Number, default: 0},
    mostRecentPlay: {type: String, default: "N/A"},
    workCooldown: {type: Date, default: null},
    coinsFromTalking: {type: Number, default: 0},
    totalCoinflipped: {type: Number, default: 0},
    winningsFromCoinflips: {type: Number, default: 0},
    totalDonated: {type: Number, default: 0},
    totalWorked: {type: Number, default: 0},
})

const getTieredCoins = (coins) => {
    //just in case I decide to change the values later on. goes from silver to plat
    if(!coins) return "`0` <:YukiBronze:872106572275392512>";
    const coinValues = [100, 100, 100];
    const coinEmotes = ['<:YukiPlat:872106609399169025>', '<:YukiGold:872106598527541248>',
        '<:YukiSilver:872106587861417994>', '<:YukiBronze:872106572275392512>']
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

const Users = mongoose.model("Users", UserData);

module.exports = { Users, getTieredCoins };