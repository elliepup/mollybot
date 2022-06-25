const mongoose = require('mongoose')

const fish = new mongoose.Schema({
    fishId: {type: String, required: true, unique: true},
    fishNo: {type: String, required: true},
    originalOwner: {type: String, require: true, unique: false},
    currentOwner: {type: String, require: true, unique: false},
    catchDate: {type: Date, default: null},
    rarity: {type: String, default: "N/A"},
    type: {type: String, default: "N/A"},
    length: {type: Number, default: 0},
    weight: {type: Number, default: 0},
    value: {type: Number, default: 0},
    color: {type: String, default: "N/A"},
})

const FishData = mongoose.model("Fish", fish);

const rarityInfo = [
    {rarity: "Common", hex: "#919191", stars: "☆☆☆☆☆"}, {rarity: "Uncommon", hex: "#FFFFFF", stars: "★☆☆☆☆"}, {rarity: "Rare", hex: "#82FDFF", stars: "★★☆☆☆"}, 
    {rarity: "Epic", hex: "#6B00FD", stars: "★★★☆☆"}, {rarity: "Legendary", hex: "#FBFF00", stars: "★★★★☆"}, {rarity: "Mythical", hex: "#FF00E0", stars: "★★★★★"}
]


module.exports = { FishData, rarityInfo };