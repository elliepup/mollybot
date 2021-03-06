const cron = require('node-cron');

cron.schedule('59 59 22 * * FRI', () => {
    const { rollLottery } = require('../utils/lotteryRoll');
    rollLottery();
})

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setPresence({ activities: [{ name: '/help', type: "LISTENING" }], status: 'online' });

        //database initialization
        const mongoose = require('mongoose')
        await mongoose.connect(process.env.MONGODB_SRV, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Connected to the database successfully.")
        })

        //cron job to run every 5 minutes
        
    }
}

