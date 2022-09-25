const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const { lastDateOfMonth } = require("../../utils/date-format");
const Contas = require("../../models/ContasModel");
const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  const date = req.queryString("date").toLowerCase();
  const limit = req.queryInt("limit");

  try {
    await Contas.findAll({
      attributes: [
        "id_conta",
        "date",
        "saldo",
        "id_instituicao",
        [
          Sequelize.literal(`SUM(
                CASE WHEN "Contas"."date" <= '${date}' 
                AND "Contas".id_users = '${req.id}'
                THEN saldo ELSE 0 END
                )
                +
                (
                  SELECT COALESCE(SUM(
                      CASE WHEN "Transactions".date <= '${lastDateOfMonth(
                        date
                      )}'
                      AND "Transactions".id_conta = "Contas".id_conta 
                      AND "Transactions".id_users = '${req.id}'
                      THEN valor ELSE 0 END
                  ),0) as saldo_contas FROM "Transactions"
              )
                `),
          "saldo_atual",
        ],
        [
          Sequelize.literal(`
                (SELECT ABS(COALESCE(SUM(
                  CASE WHEN "Transactions".date <= '${lastDateOfMonth(date)}'
                  AND "Transactions".id_conta = "Contas".id_conta 
                  AND "Transactions".id_users = '${req.id}'
                  AND "Transactions".objetivo = true
                  THEN valor ELSE 0 END
                ),0)) FROM "Transactions")
                `),
          "saldo_objetivo",
        ],
      ],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome", "cor", "icone"],
          as: "instituicao",
        },
      ],
      where: {
        contaObjetivo: {
          [Sequelize.Op.ne]: true,
        },
        id_cartao: {
          [Sequelize.Op.eq]: null,
        },
        id_users: req.id,
      },
      order: [[Sequelize.literal("saldo_atual DESC")]],
      group: ["id_conta", "instituicao.id_instituicao"],
      limit: limit ? limit : 4,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
