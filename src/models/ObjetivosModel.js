const Sequelize = require('sequelize');
const database = require('../database');
const Categorias = require('./CategoriasModel');
const Users = require('./UsersModel');

const Objetivos = database.define('Objetivos', {
  id_objetivo: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  titulo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cor: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  icone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  valor_total: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

Objetivos.belongsTo(Categorias, { constraint: true, foreignKey: 'id_categoria', as: 'categoria' });
Categorias.hasMany(Objetivos, { foreignKey: 'id_categoria' });

Objetivos.belongsTo(Users, { constraint: true, foreignKey: 'id_users', as: 'users' });
Users.hasMany(Objetivos, { foreignKey: 'id_users' });

module.exports = Objetivos;
