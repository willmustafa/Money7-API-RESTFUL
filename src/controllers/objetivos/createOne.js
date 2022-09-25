const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  let nome = req.bodyString("nome").toLowerCase();
  let cor = req.bodyString("cor").toLowerCase();
  let icone = req.bodyString("icone").toLowerCase();

  if (!nome || !cor || !icone)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: nome, cor, icone",
    });

  try {
    await Instituicoes.create({
      nome,
      cor,
      icone,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
