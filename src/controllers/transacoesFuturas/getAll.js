const { CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST } =
  require("http-status-codes").StatusCodes;

const sequelize = require("sequelize");
const TransacoesFuturas = require("../../models/TransacoesFuturas");
const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res, next) => {
  const date = req.queryString("date");
  if (!date)
    return res.status(BAD_REQUEST).json({ message: "Date is required." });

  try {
    await TransacoesFuturas.findAll({
      include: [
        {
          model: Categorias,
          attributes: ["nome", "cor", "icone"],
          as: "categoria",
        },
      ],
      where: {
        id_users: req.id,
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn("date_part", "month", sequelize.col("dataPrevista")),
            sequelize.Op.eq,
            sequelize.fn(
              "date_part",
              "month",
              sequelize.cast(date, "timestamp")
            )
          ),
          sequelize.where(
            sequelize.fn("date_part", "year", sequelize.col("dataPrevista")),
            sequelize.Op.eq,
            sequelize.fn("date_part", "year", sequelize.cast(date, "timestamp"))
          ),
        ],
      },
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
