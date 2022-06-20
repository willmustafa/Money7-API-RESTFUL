const Sequelize = require('sequelize');
const database = require('./index');

// Importa os modelos disponíveis na API
const models = require('../models/models');

(async () => {
  try {
    await database.sync();
  } catch (error) {
    console.error('Falhou em iniciar o banco de dados');
    console.log(error);
  }
})();
