const mongoose = require('mongoose')

const fish = new mongoose.Schema({
    fishId: {type: String, required: true, unique: true},
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
    {rarity: "Common", hex: "#B9B9B9", stars: "☆☆☆☆☆"}, {rarity: "Uncommon", hex: "#CEFFF4", stars: "★☆☆☆☆"}, {rarity: "Rare", hex: "#00FEC5", stars: "★★☆☆☆"}, 
    {rarity: "Epic", hex: "#B200FF", stars: "★★★☆☆"}, {rarity: "Legendary", hex: "#FFDC00", stars: "★★★★☆"}, {rarity: "Mythical", hex: "#FF42DD", stars: "★★★★★"}
]

module.exports = { FishData, rarityInfo };