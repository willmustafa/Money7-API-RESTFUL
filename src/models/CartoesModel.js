const Sequelize = require('sequelize')
const database = require('../database')
const Instituicoes = require('./InstituicoesModel')
const Users = require('./UsersModel')

const Cartoes = database.define('Cartoes', {
	id_cartao: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	limite: {
		type: Sequelize.DOUBLE,
		allowNull: false,
	},
	vencimento: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 15,
	},
	fechamento: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 8,
	},
})

Cartoes.belongsTo(Instituicoes, { constraint: true, foreignKey: 'id_instituicao', as: 'instituicao' })
Instituicoes.hasMany(Cartoes, { foreignKey: 'id_instituicao' })

Cartoes.belongsTo(Users, { constraint: true, foreignKey: 'id_users', as: 'users' })
Users.hasMany(Cartoes, { foreignKey: 'id_users' })

// Cartoes.hasOne(Contas, {foreignKey: 'id_cartao', as: 'cartao'})

module.exports = Cartoes
