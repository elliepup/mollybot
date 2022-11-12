const { LotteryEntry } = require('./../models/LotteryEntry');
const LootTable = require('loot-table');
const { User } = require('./../models/User');
const { ClientInfo } = require('./../models/ClientInfo');
async function rollLottery() {
    const entries = await LotteryEntry.find({});
    const lootTable = new LootTable();
    for (entry of entries) {
        lootTable.add(entry.user, entry.tickets);
    }

    const winner = lootTable.choose();
    const winnerUser = await User.findById(winner);
    const mollyUser = await User.findOne({ userId: "911276391901843476" })
    const jackpot = mollyUser.balance;

    const clientInfo = await ClientInfo.findOne({}) || await ClientInfo.create({});
    await clientInfo.updateOne({ $set: {lastJackpotWinner: winnerUser, lastJackpot: jackpot} });

    await winnerUser.updateOne({ $inc: {balance: jackpot} });
    await mollyUser.updateOne({ $set: {balance: 0} });
    await LotteryEntry.deleteMany({});

}

module.exports = { rollLottery };