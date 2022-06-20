const Sequelize = require('sequelize');
const database = require('../database');

const Instituicoes = database.define('Instituicoes', {
  id_instituicao: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
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
});

module.exports = Instituicoes;
