const mongoose = require('mongoose')

const lotteryEntry = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true},
    tickets: {type: Number, default: 0},
})

const LotteryEntry = mongoose.model("LotteryEntry", lotteryEntry);

module.exports = { LotteryEntry };

