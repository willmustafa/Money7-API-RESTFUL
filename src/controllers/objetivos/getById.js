const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Objetivos = require("../../models/ObjetivosModel");
const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res, next) => {
  const id = req.paramString("id");
  if (!id)
    return res
      .status(BAD_REQUEST)
      .json({ message: "O id deve ser passado na url." });

  try {
    await Objetivos.findByPk(id, {
      attributes: [
        "id_objetivo",
        "titulo",
        "cor",
        "valor_total",
        "date",
        "id_categoria",
        "description",
      ],
      include: [
        {
          model: Categorias,
          attributes: ["nome", "cor", "icone"],
          as: "categoria",
        },
      ],
      where: {
        id_users: req.id,
      },
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
