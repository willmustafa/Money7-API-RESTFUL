const Sequelize = require('sequelize')

// Configs
const databaseConfig = {
	dialect: 'postgres',
	protocol: 'postgres',
	host: process.env.DATABASE_URL,
	username: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASS,
	database: process.env.DATABASE_DB,
	logging: false,
	dialectOptions: {
		ssl: true
	},
	ssl: { rejectUnauthorized: false }
}

// INIT
const connection = new Sequelize(databaseConfig)

module.exports = connection
