const Sequelize = require('sequelize');
const database = require('../database');
const Instituicoes = require('./InstituicoesModel');
const Users = require('./UsersModel');

const Contas = database.define('Contas', {
  id_conta: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  saldo: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

Contas.belongsTo(Instituicoes, { constraint: true, foreignKey: 'id_instituicao', as: 'instituicao' });
Instituicoes.hasMany(Contas, { foreignKey: 'id_instituicao' });

Contas.belongsTo(Users, { constraint: true, foreignKey: 'id_users', as: 'users' });
Users.hasMany(Contas, { foreignKey: 'id_users' });

module.exports = Contas;
