const Sequelize = require("sequelize");
const database = require("../database");
const Categorias = require("./CategoriasModel");
const Users = require("./UsersModel");

const TransacoesFuturas = database.define("TransacoesFuturas", {
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
  dataPrevista: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

TransacoesFuturas.belongsTo(Categorias, {
  constraint: true,
  foreignKey: "id_categoria",
  as: "categoria",
});
Categorias.hasMany(TransacoesFuturas, { foreignKey: "id_categoria" });

TransacoesFuturas.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(TransacoesFuturas, { foreignKey: "id_users" });

module.exports = TransacoesFuturas;
