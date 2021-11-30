const Users = require('../models/Users')

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {

        const target = message.author;
        if(target.isBot) return;

        const randomNumber = Math.floor(Math.random() * 100);
        if(randomNumber < 79) return;
        const userData = await Users.findOne({userId: message.author.id}) || await Users.create({userId: message.author.id});
        await Users.findOneAndUpdate({userId: userData.userId}, {$inc: {balance: randomNumber - 59}})
    }
}