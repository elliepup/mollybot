const mongoose = require('mongoose')

const Prefixes = new mongoose.Schema({
    guildID: {type: String, required: true, unique: true},
    prefix: {type: String, default: 'm!'}
})

const model = mongoose.model("Prefixes", Prefixes);

module.exports = model;