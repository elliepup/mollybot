const mongoose = require('mongoose')

const guildData = new mongoose.Schema({
    guildId: {type: String, required: true, unique: true},
    bestCatch: {type: Array, default: null},
    bestCatchDate: {type: Date, default: null},
    bestCatchToday: {type: Array, default: null},
    bestCatchTodayDate: {type: Date, default: null},
})

const GuildData = mongoose.model("GuildData", guildData);

module.exports = { GuildData };