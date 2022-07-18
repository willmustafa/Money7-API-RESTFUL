const Sequelize = require("sequelize");
const database = require("./index");

// Importa os modelos disponíveis na API
const models = require("../models/models");

// Insere os arquivos padrões
const instituicoesInitialData = require("../config/instituicoesInitialData");
(async () => {
  try {
    await database.sync({ alter: true });

    // Initial data
    await models.instituicoes.bulkCreate(instituicoesInitialData, {
      ignoreDuplicates: true,
    });
  } catch (error) {
    console.error("Falhou em iniciar o banco de dados");
    console.log(error);
  }
})();
