const Sequelize = require("sequelize");
const database = require("../database");
const Users = require("./UsersModel");

const IgnorarNomes = database.define("IgnorarNomes", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue("nome", String(value).toLowerCase());
    },
    get() {
      this.getDataValue("nome").toLowerCase();
    },
  },
});

IgnorarNomes.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(IgnorarNomes, { foreignKey: "id_users" });

module.exports = IgnorarNomes;
