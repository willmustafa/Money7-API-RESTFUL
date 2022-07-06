const Sequelize = require('sequelize')

// Configs
const databaseConfig = {
	connectionString: `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_URL}:${process.env.DATABASE_PORT}/${process.env.DATABASE_DB}?sslmode=require`,
	dialectOptions: {
		ssl: {
			rejectUnauthorized: false,
		}
	}
}

// INIT
const connection = new Sequelize(databaseConfig)

module.exports = connection
