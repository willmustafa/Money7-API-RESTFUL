const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;
const Sequelize = require("sequelize");

const Objetivos = require("../../models/ObjetivosModel");
const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res, next) => {
  let limit = req.queryInt("limit");
  let status = req.queryString("status");

  limit = limit ? limit : 100;
  if (status == undefined) status = "ativado";

  try {
    await Objetivos.findAll({
      attributes: [
        "id_objetivo",
        "titulo",
        "cor",
        "status",
        "valor_total",
        "date",
        "id_categoria",
        "description",
        "id_conta",
        [
          Sequelize.literal(`(
        SELECT COALESCE(SUM(
            CASE WHEN "Transactions".id_conta = "Objetivos".id_conta 
            AND "Transactions".id_users = '${req.id}'
            THEN valor ELSE 0 END
        ),0) as saldo_contas FROM "Transactions"
      )`),
          "saldo_atual",
        ],
        [
          Sequelize.literal(`(
        SELECT COALESCE(SUM(
            CASE WHEN "Transactions".id_conta = "Objetivos".id_conta 
            AND "Transactions".id_users = '${req.id}'
            THEN valor ELSE 0 END
        ),0) as saldo_contas FROM "Transactions"
      ) - valor_total`),
          "diferenca",
        ],
      ],
      include: [
        {
          model: Categorias,
          attributes: ["nome", "cor", "icone"],
          as: "categoria",
        },
      ],
      where: {
        id_users: req.id,
        status,
      },
      order: [[Sequelize.literal('"diferenca" ASC')], ["date", "ASC"]],
      limit,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
