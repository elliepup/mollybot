const mongoose = require('mongoose')

const tradeRecord = new mongoose.Schema({
    traderId: {type: String, required: true, unique: false},
    partnerId: {type: String, required: true, unique: false},
    tradeId: {type: String, require: true},
    traderFishOffering: {type: Array},
    partnerFishOffering: {type: Array},
    traderCoins: {type: Number, default: 0},
    partnerCoins: {type: Number, default: 0},
    timeCompleted: {type: Date, default: null}
})

const TradeData = mongoose.model("tradeRecord", tradeRecord);

module.exports = TradeData;