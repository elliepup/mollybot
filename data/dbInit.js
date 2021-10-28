const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('econsystem', 'username', process.env.DBPASS, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'econsystem.sqlite',
});

const CurrencyShop = require('../models/CurrencyShop')(sequelize, Sequelize.DataTypes);
require('../models/Users')(sequelize, Sequelize.DataTypes);
require('../models/UserItems')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: 'Beans', cost: 250, effect: "Causes severe mental retardation. Unfortunately, there is no cure." }),
		CurrencyShop.upsert({ name: 'Kidney Beans', cost: 375, effect: "One of the best foods known to man." }),
		CurrencyShop.upsert({ name: 'Premium Kidney Beans', cost: 750, effect: "The only thing better than kidney beans, premium kidney beans." }),
	];
	await Promise.all(shop);
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);
