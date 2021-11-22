const mongoose = require('mongoose')

const UserData = new mongoose.Schema({
    userId: {type: String, require: true, unique: true},
    balance: {type: Number, default: 100},
    songsPlayed: {type: Number, default: 0},
    songsSkipped: {type: Number, default: 0},
    songsRemoved: {type: Number, default: 0},
    queuesStopped: {type: Number, default: 0},
    timesPaused: {type: Number, default: 0},
    timesResumed: {type: Number, default: 0},
    mostRecentPlay: {type: String}

})

const model = mongoose.model("Users", UserData);

module.exports = model;