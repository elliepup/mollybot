const mongoose = require('mongoose')

const fishingProfile = new mongoose.Schema({
    userId: {type: String, require: true, unique: true},
    tierOneBait: {type: Number, default: 5},
    tierTwoBait: {type: Number, default: 3},
    tierThreeBait: {type: Number, default: 1},
    timesFished: {type: Number, default: 0},
    fishCaught: {type: Number, default: 0},
    trashCaught: {type: Number, default: 0},
    ancientRelicsCaught: {type: Number, default: 0},
    fishSold: {type: Number, default: 0},
    fishingCooldown: {type: Date, default: null}
})

const FishingData = mongoose.model("FishingProfile", fishingProfile);

module.exports = FishingData;