const mongoose = require('mongoose')

const guildData = new mongoose.Schema({
    guildId: {type: String, required: true, unique: true},
    bestCatch: {type: mongoose.Schema.Types.ObjectId, ref: 'Fish'},
    bestCatchDate: {type: Date, default: null},
    bestCatchToday: {type: mongoose.Schema.Types.ObjectId, ref: 'Fish'},
    bestCatchTodayDate: {type: Date, default: null},
})

const GuildData = mongoose.model("GuildData", guildData);

module.exports = { GuildData };