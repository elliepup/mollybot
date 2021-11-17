const mongoose = require('mongoose')

const UserData = new mongoose.Schema({
    userID: {type: String, require: true, unique: true},
    balance: {type: Number, default: 0},
    songsPlayed: {type: Number, default: 0},
    songsSkipped: {type: Number, default: 0},
})

const model = mongoose.model("Users", UserData);

module.exports = model;