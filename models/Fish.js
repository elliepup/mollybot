const mongoose = require('mongoose')

const fish = new mongoose.Schema({
    originalOwner: {type: String, require: true, unique: true},
    
})

const FishData = mongoose.model("Fish", fish);

module.exports = FishData;