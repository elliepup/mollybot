const Sequelize = require('sequelize');

const sequelize = new Sequelize('econsystem', 'username', process.env.DBPASS, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: './data/econsystem.sqlite',
});

const Users = require('../models/Users')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('../models/CurrencyShop')(sequelize, Sequelize.DataTypes);
const UserItems = require('../models/UserItems')(sequelize, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

//UserNotes.belongsTo(Users, { foreignKey: 'user_id', as: 'user_id'})

/* eslint-disable-next-line func-names */
Users.prototype.addItem = async function(item) {
	const userItem = await UserItems.findOne({
		where: { user_id: this.user_id, item_id: item.id },
	});

	if (userItem) {
		userItem.amount += 1;
		return userItem.save();
	}

	return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
};

/* eslint-disable-next-line func-names */
Users.prototype.getItems = function() {
	return UserItems.findAll({
		where: { user_id: this.user_id },
		include: ['item'],
	});
};

module.exports = { Users, CurrencyShop, UserItems };