const Sequelize = require("sequelize");
const database = require("../database");
const Cartoes = require("./CartoesModel");
const Instituicoes = require("./InstituicoesModel");
const Users = require("./UsersModel");

const Contas = database.define("Contas", {
  id_conta: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  saldo: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  contaObjetivo: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

Contas.belongsTo(Instituicoes, {
  constraint: true,
  foreignKey: "id_instituicao",
  as: "instituicao",
});
Instituicoes.hasMany(Contas, { foreignKey: "id_instituicao" });

Contas.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(Contas, { foreignKey: "id_users" });

Contas.belongsTo(Cartoes, {
  constraint: true,
  foreignKey: "id_cartao",
  as: "cartao",
});
Cartoes.hasOne(Contas, { foreignKey: "id_cartao" });

module.exports = Contas;
