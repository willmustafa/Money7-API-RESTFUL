const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Cartoes = require("../../models/CartoesModel");
const Instituicoes = require("../../models/InstituicoesModel");
const Contas = require("../../models/ContasModel");
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
          sequelize.literal(`(
          SELECT ABS(COALESCE(SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}')
              AND "Transactions".id_users = '${req.id}'  
              AND "Transactions".id_conta = "Contas".id_conta THEN valor ELSE 0 END
          ),0)) as saldo_contas FROM "Transactions"
          )`),
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
      ],
      where: {
        id_cartao: {
          [sequelize.Op.ne]: null,
        },
        id_users: req.id,
      },
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
