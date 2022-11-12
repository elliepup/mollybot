const mongoose = require('mongoose')

const econProfile = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    lastWorked: {type: Date, default: null},
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

module.exports = { EconData };