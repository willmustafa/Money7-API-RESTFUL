const Sequelize = require("sequelize");
const database = require("../database");
const Categorias = require("./CategoriasModel");
const Contas = require("./ContasModel");
const Users = require("./UsersModel");

const Transactions = database.define("Transactions", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  valor: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  descricao: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  objetivo: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

Transactions.belongsTo(Contas, {
  constraint: true,
  foreignKey: "id_conta",
  as: "conta",
});
Contas.hasMany(Transactions, { foreignKey: "id_conta" });

Transactions.belongsTo(Categorias, {
  constraint: true,
  foreignKey: "id_categoria",
  as: "categoria",
});
Categorias.hasMany(Transactions, { foreignKey: "id_categoria" });

Transactions.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(Transactions, { foreignKey: "id_users" });

module.exports = Transactions;
