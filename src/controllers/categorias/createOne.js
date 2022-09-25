const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR, CONFLICT } =
  require("http-status-codes").StatusCodes;
const Sequelize = require("sequelize");

const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res, next) => {
  let nome = req.bodyString("nome").toLowerCase();
  let cor = req.bodyString("cor").toLowerCase();
  let icone = req.bodyString("icone").toLowerCase();
  let tipo = req.bodyString("tipo").toLowerCase();

  if (!nome || !cor || !icone || !tipo)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: nome, cor, icone, tipo",
    });

  const existentes = await Categorias.findAll({
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

  try {
    await Categorias.create({
      nome,
      cor,
      icone,
      tipo,
      id_users: req.id,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
