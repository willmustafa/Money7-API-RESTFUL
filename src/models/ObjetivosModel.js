const Sequelize = require("sequelize");
const database = require("../database");
const Categorias = require("./CategoriasModel");
const Contas = require("./ContasModel");
const Users = require("./UsersModel");

const Objetivos = database.define("Objetivos", {
  id_objetivo: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
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
  valor_total: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING,
  },
});

Objetivos.belongsTo(Categorias, {
  constraint: true,
  foreignKey: "id_categoria",
  as: "categoria",
});
Categorias.hasMany(Objetivos, { foreignKey: "id_categoria" });

Objetivos.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(Objetivos, { foreignKey: "id_users" });

Objetivos.belongsTo(Contas, {
  constraint: true,
  foreignKey: "id_conta",
  as: "conta",
});
Contas.hasMany(Objetivos, { foreignKey: "id_conta" });

module.exports = Objetivos;
