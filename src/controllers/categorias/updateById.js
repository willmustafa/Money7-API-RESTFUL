const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

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

  const id = req.paramString("id");

  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Categorias.update(
      {
        nome,
        cor,
        icone,
        tipo,
      },
      {
        where: {
          id_categoria: id,
          id_users: req.id,
        },
      }
    )
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
