const Sequelize = require("sequelize");
const database = require("../database");
const Users = require("./UsersModel");

const Tags = database.define("Tags", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Tags.belongsTo(Users, {
  constraint: true,
  foreignKey: "id_users",
  as: "users",
});
Users.hasMany(Tags, { foreignKey: "id_users" });

module.exports = Tags;
