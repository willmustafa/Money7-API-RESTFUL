const Sequelize = require("sequelize");
const database = require("../database");

const Instituicoes = database.define("Instituicoes", {
  id_instituicao: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "",
  },
  razao_social: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  cnpj: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  cor: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: "bg-success",
  },
  icone: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: "building-columns",
  },
});

module.exports = Instituicoes;
