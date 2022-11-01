const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Contas = require("../../models/ContasModel");

module.exports = async (req, res, next) => {
  let saldo = req.bodyFloat("saldo");
  let date = req.bodyString("date").toLowerCase();
  let id_instituicao = req.bodyString("id_instituicao").toLowerCase();

  if (!!saldo || !!date || !!id_instituicao)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: saldo, date, id_instituicao",
    });

  const id = req.paramString("id");

  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Contas.update(
      {
        saldo,
        date,
        id_instituicao,
      },
      {
        where: {
          id_conta: id,
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
