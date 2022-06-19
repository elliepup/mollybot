const mongoose = require('mongoose')

const fishingProfile = new mongoose.Schema({
    userId: {type: String, require: true, unique: true},
    tierOneBait: {type: Number, default: 5},
    tierTwoBait: {type: Number, default: 3},
    tierThreeBait: {type: Number, default: 1},
    tierFourBait: {type: Number, default: 0},
    timesFished: {type: Number, default: 0},
    fishCaught: {type: Number, default: 0},
    trashCaught: {type: Number, default: 0},
    ancientRelicsCaught: {type: Number, default: 0},
    fishSold: {type: Number, default: 0},
    lastFished: {type: Date, default: null},
    isFishing: {type: Boolean, default: false},
    isGifting: {type: Boolean, default: false},
    isTrading: {Type: Boolean, default: false},
    isSelling: {Type: Boolean, default: false},
    fishSold: {Type: Number, default: 0}
})

const FishingData = mongoose.model("FishingProfile", fishingProfile);

module.exports = FishingData;