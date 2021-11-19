module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.tag} has logged in successfully.`);
        client.user.setActivity("Maintenance Mode 😒", {type: "PLAYING"})
        
    }
}