module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

		console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setActivity("m!help", {type: "LISTENING"})
	},
};