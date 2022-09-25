const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Cartoes = require("../../models/CartoesModel");
const Instituicoes = require("../../models/InstituicoesModel");
const Contas = require("../../models/ContasModel");
const sequelize = require("sequelize");

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

  const id = req.paramString("id");

  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Cartoes.update(
      {
        vencimento,
        fechamento,
        limite,
        id_instituicao,
      },
      {
        where: {
          id_cartao: req.params.id,
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
