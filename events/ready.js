module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

		const mongoose = require('mongoose')
		console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setActivity("m!help", {type: "LISTENING"})

		await mongoose.connect(process.env.MONGODB_SRV, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).then(() => {
			console.log("Connected to the database successfully.")
		})
	}
};