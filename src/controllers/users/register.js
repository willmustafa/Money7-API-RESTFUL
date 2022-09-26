const { CREATED } = require("http-status-codes").StatusCodes;

const bcrypt = require("bcrypt");
const Users = require("../../models/UsersModel");
const categoriasInitialData = require("../../config/categoriasInitialData");
const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res) => {
  let username = req.bodyString("username");
  let user = req.bodyString("user");
  let pwd = req.bodyString("pwd");

  if (!username || !user || !pwd)
    return res
      .status(400)
      .json({ message: "Username, user, pwd is required." });

  const salt = await bcrypt.genSalt(10);
  pwd = String(pwd.toString());
  const usr = {
    name: username,
    email: user,
    password: await bcrypt.hash(pwd, salt),
  };

  const createdUser = Users.create(usr, { raw: true });

  await Categorias.bulkCreate(
    categoriasInitialData.map((el) => {
      return { ...el, id_users: createdUser.id };
    }),
    {
      ignoreDuplicates: true,
    }
  );
  res.status(CREATED).json(createdUser);
};
