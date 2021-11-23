module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setActivity("Maintenance Mode 😒", { type: "PLAYING" })

        //database init
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_SRV, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Connected to the database successfully.")
        })
    }
}