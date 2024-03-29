const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Cartoes = require("../../models/CartoesModel");
const Contas = require("../../models/ContasModel");

module.exports = async (req, res, next) => {
  let vencimento = req.bodyString("vencimento");
  let fechamento = req.bodyInt("fechamento");
  let limite = req.bodyInt("limite");
  let id_instituicao = req.bodyString("id_instituicao");

  if (!vencimento || !fechamento || !limite || !id_instituicao)
    return res.status(BAD_REQUEST).json({
      message:
        "Campos necessários: vencimento, fechamento, limite, id_instituicao",
    });

  try {
    await Cartoes.create({
      vencimento,
      fechamento,
      limite,
      id_instituicao,
      id_users: req.id,
    })
      .then(async (data) => {
        await Contas.create({
          id_cartao: data.dataValues.id_cartao,
          id_instituicao,
          id_users: req.id,
        }).then((data) => res.status(CREATED).json(data));
      })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
