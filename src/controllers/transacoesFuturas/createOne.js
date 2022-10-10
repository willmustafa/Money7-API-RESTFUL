const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const TransacoesFuturas = require("../../models/TransacoesFuturas");

module.exports = async (req, res, next) => {
  let descricao = req.bodyString("descricao");
  let id_categoria = req.bodyString("id_categoria");
  let valor = req.bodyFloat("valor");
  let dataPrevista = req.bodyString("dataPrevista").toLowerCase();

  if (!descricao || !valor || !dataPrevista)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: descricao, valor e dataPrevista",
    });

  dataPrevista = new Date(dataPrevista).toISOString();

  try {
    await TransacoesFuturas.create({
      valor,
      descricao,
      dataPrevista,
      id_categoria,
      id_users: req.id,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
