const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Contas = require("../../models/ContasModel");
const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  const id = req.paramString("id");
  if (!id)
    return res
      .status(BAD_REQUEST)
      .json({ message: "O id deve ser passado na url." });

  try {
    await Contas.findByPk(id, {
      attributes: ["id_conta", "saldo", "date", "id_instituicao"],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome", "cor", "icone"],
          as: "instituicao",
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
