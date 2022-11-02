const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const IgnorarNomes = require("../../models/IgnorarNomesModel");

module.exports = async (req, res, next) => {
  let nome = req.bodyString("nome");

  if (!nome)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: nome",
    });

  try {
    const existentes = await IgnorarNomes.findAll({
      where: {
        nome: {
          [Sequelize.Op.iLike]: nome,
        },
        id_users: req.id,
      },
    });

    if (existentes.length > 0) {
      return res.status(CONFLICT).json({ message: "Já existe" });
    }
  } catch (error) {
    return next(error);
  }

  try {
    await IgnorarNomes.create({
      nome,
      id_users: req.id,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
