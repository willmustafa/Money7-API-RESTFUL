const { BAD_REQUEST, INTERNAL_SERVER_ERROR, GONE } =
  require("http-status-codes").StatusCodes;

const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  const id = req.paramString("id");
  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Instituicoes.destroy({
      where: {
        id_instituicao: id,
      },
    })
      .then((data) => res.status(GONE).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
