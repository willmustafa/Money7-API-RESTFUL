const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Transactions = require("../../models/TransactionModel");
const Categorias = require("../../models/CategoriasModel");
const Contas = require("../../models/ContasModel");
const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  const id = req.paramString("id");
  if (!id)
    return res
      .status(BAD_REQUEST)
      .json({ message: "O id deve ser passado na url." });

  try {
    await Transactions.findByPk(id, {
      attributes: ["valor", "descricao", "date"],
      include: [
        {
          model: Categorias,
          attributes: ["nome", "cor", "icone"],
          as: "categoria",
        },
        {
          model: Contas,
          as: "conta",
          include: [
            {
              model: Instituicoes,
              attributes: ["nome", "cor", "icone"],
              as: "instituicao",
            },
          ],
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
