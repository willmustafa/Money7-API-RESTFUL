const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const Tags = require("../../models/TagsModel");

module.exports = async (req, res, next) => {
  let nome = req.bodyString("nome").toLowerCase();

  if (!nome)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: nome",
    });

  try {
    const existentes = await Tags.findAll({
      where: {
        nome: {
          [Sequelize.Op.iLike]: nome,
        },
      },
    });

    if (existentes.length > 0) {
      return res.status(CONFLICT).json({ message: "Já existe" });
    }
  } catch (error) {
    return next(error);
  }

  try {
    await Tags.create({
      nome,
      id_users: req.id,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
