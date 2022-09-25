const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const Contas = require("../../models/ContasModel");
const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  const contaObjetivo = req.queryString("contaObjetivo").toLowerCase();

  let contaObjetivoObj = { contaObjetivo: { [Sequelize.Op.ne]: true } };
  if (contaObjetivo !== undefined && contaObjetivo === "true")
    contaObjetivoObj = {};

  try {
    await Contas.findAll({
      attributes: [
        "id_conta",
        "saldo",
        "date",
        "id_instituicao",
        "contaObjetivo",
      ],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome", "cor", "icone"],
          as: "instituicao",
        },
      ],
      where: {
        ...contaObjetivoObj,
        id_cartao: {
          [Sequelize.Op.eq]: null,
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
