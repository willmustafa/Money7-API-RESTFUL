const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Cartoes = require("../../models/CartoesModel");
const Instituicoes = require("../../models/InstituicoesModel");
const Contas = require("../../models/ContasModel");
const Transaction = require("../../models/TransactionModel");
const sequelize = require("sequelize");

module.exports = async (req, res, next) => {
  const date = req.queryString("date");
  if (!date)
    return res
      .status(BAD_REQUEST)
      .json({ message: "Campo date é necessário." });

  try {
    await Contas.findAll({
      attributes: [
        "id_conta",
        "id_instituicao",
        "id_cartao",
        [
          sequelize.fn("sum", sequelize.col("Transactions.valor")),
          "saldo_atual",
        ],
      ],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome", "cor", "icone"],
          as: "instituicao",
        },
        {
          model: Cartoes,
          attributes: ["limite", "vencimento", "fechamento"],
          as: "cartao",
        },
        {
          model: Transaction,
          attributes: ["date", "id_users", "id_conta", "valor"],
        },
      ],
      where: {
        id_cartao: {
          [sequelize.Op.ne]: null,
        },
        id_users: req.id,
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn(
              "date_part",
              "month",
              sequelize.col("Transactions.date")
            ),
            sequelize.Op.eq,
            sequelize.fn(
              "date_part",
              "month",
              sequelize.cast(date, "timestamp")
            )
          ),
          sequelize.where(
            sequelize.fn(
              "date_part",
              "year",
              sequelize.col("Transactions.date")
            ),
            sequelize.Op.eq,
            sequelize.fn("date_part", "year", sequelize.cast(date, "timestamp"))
          ),
        ],
      },
      group: [
        "Contas.id_conta",
        "instituicao.id_instituicao",
        "cartao.id_cartao",
        "Transactions.id",
      ],
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
