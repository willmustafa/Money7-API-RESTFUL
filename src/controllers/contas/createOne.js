const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Contas = require("../../models/ContasModel");

module.exports = async (req, res, next) => {
  let saldo = req.bodyFloat("saldo").toLowerCase();
  let date = req.bodyString("date").toLowerCase();
  let id_instituicao = req.bodyString("id_instituicao").toLowerCase();

  if (saldo === undefined || date === undefined || id_instituicao === undefined)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: saldo, date, id_instituicao",
    });

  try {
    await Contas.create({
      saldo: saldo,
      date: date,
      id_instituicao: id_instituicao,
      id_users: req.id,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
