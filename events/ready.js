module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
      console.log(`${client.user.tag} has logged in successfully.`)
      client.user.setPresence({ activities: [{ name: 'under maintenance', type: 0 }], status: 'dnd' });

      //initialize database stuff in the future once we get the bot in a state that is ready for fishing commands
  }
}