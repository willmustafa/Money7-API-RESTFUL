const Sequelize = require('sequelize');
const database = require('../database');
const Users = require('./UsersModel');

const Categorias = database.define('Categorias', {
  id_categoria: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cor: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 'bg-success',
  },
  icone: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: 'building-columns',
  },
  tipo: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
  },
});

Categorias.belongsTo(Users, { constraint: true, foreignKey: 'id_users', as: 'users' });
Users.hasMany(Categorias, { foreignKey: 'id_users' });

module.exports = Categorias;
