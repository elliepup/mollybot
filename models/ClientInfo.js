const mongoose = require('mongoose')

const clientInfo = new mongoose.Schema({
    lastJackpot: {type: Number, default: 0},
    lastJackpotWinner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    shinyRate: {type: mongoose.Schema.Types.Decimal128, default: 0},
    fishingCooldown: {type: Number, default: 300},
    workCooldown: {type: Number, default: 3600},
})

const ClientInfo = mongoose.model("ClientInfo", clientInfo);

module.exports = { ClientInfo };