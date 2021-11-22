const Users = require('../models/Users')

module.exports = {
    name: 'messageCreate',
    async execute(message) {

        
        const author = message.author;
        if (author.isBot) return;
        const randomNumber = Math.floor(Math.random() * 100);

        if (randomNumber < 79) return;

        let userData = await Users.findOne({ userId: author.id });
        if (!userData) {
            await Users.create({ userId: author.id }).then((newData) => userData = newData)
        }

        await Users.findOneAndUpdate({userData}, {$inc: {balance: randomNumber - 78}})
    }
}