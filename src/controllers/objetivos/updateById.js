const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Objetivos = require("../../models/ObjetivosModel");

module.exports = async (req, res, next) => {
  let titulo = req.bodyString("titulo").toLowerCase();
  let cor = req.bodyString("cor").toLowerCase();
  let valor = req.bodyFloat("valor").toLowerCase();
  let date = req.bodyString("date").toLowerCase();
  let description = req.bodyString("description").toLowerCase();
  let id_categoria = req.bodyString("id_categoria").toLowerCase();
  let status = req.bodyString("status");
  if (!status) status = "ativado";

  if (!titulo || !cor || !valor || !date || !id_categoria)
    return res.status(BAD_REQUEST).json({
      message:
        "Campos necessários: titulo, cor, valor, date, description, id_categoria",
    });

  const id = req.paramString("id");

  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Objetivos.update(
      {
        titulo,
        cor,
        valor_total: valor,
        description,
        date,
        status,
        id_categoria,
      },
      {
        where: {
          id_objetivo: id,
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
