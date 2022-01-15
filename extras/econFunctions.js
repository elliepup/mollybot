const axios = require('axios');

const getTieredCoins = (coins) => {
    //just in case I decide to change the values later on. goes from silver to plat
    if (!coins) return "`0` <:YukiBronze:872106572275392512>";
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
    for (let i = 0; i < coinArr.length; i++) {
        formattedString += (coinArr[i] != 0) ? `\`${coinArr[i]}\` ${coinEmotes[i]} ` : ""
    }
    return formattedString || "`0` <:YukiBronze:872106572275392512>";
}

//returns user balance
const getBalance = async (userId) => {
    var balance;
    
    const config = {
        headers: {
            'fauna-secret': process.env.FAUNA_SERVER_SECRET
        }
    }
    await axios.get(`http://localhost:3000/users/${userId}`, config)
        .then(response => {
            balance = response.data.data.balance;
        })
    return balance;
}

const getEconProfile = async (userId) => {
    var content;
    const config = {
        headers: {
            'fauna-secret': process.env.FAUNA_SERVER_SECRET
        }
    }
    await axios.get(`http://localhost:3000/econprofile/${userId}`, config)
    .then(response => {
        content = response;
    })

    return content.data.data;
}

const updateBalance = async (userId, additionalCoins) => {
    await axios.post(`http://localhost:3000/users/update/${userId}`, {
        'additionalCoins': additionalCoins
    })
}

const updateEconAttribute = async(userId, attribute, amountToChange) => {
    await axios.post(`http://localhost:3000/econprofile/update/${userId}`, {
        'amountToChange': amountToChange,
        'attribute': attribute
    })
}

module.exports = { getTieredCoins, getBalance, getEconProfile, updateBalance, updateEconAttribute };