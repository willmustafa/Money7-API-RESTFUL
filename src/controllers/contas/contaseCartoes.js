const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const Contas = require("../../models/ContasModel");
const Cartoes = require("../../models/CartoesModel");
const Instituicoes = require("../../models/InstituicoesModel");
const Objetivos = require("../../models/ObjetivosModel");

module.exports = async (req, res, next) => {
  const contaObjetivo = req.queryString("contaObjetivo")?.toLowerCase();

  let contaObjetivoObj = { contaObjetivo: { [Sequelize.Op.ne]: true } };

  let group = [
    "Contas.id_cartao",
    "Contas.id_conta",
    "instituicao.id_instituicao",
    "cartao.id_cartao",
  ];

  let include = [
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
  ];

  if (contaObjetivo !== undefined) {
    contaObjetivoObj = {};
    group.push("Objetivos.id_objetivo");
    include.push({ model: Objetivos });
  }

  try {
    await Contas.findAll({
      attributes: [
        "id_conta",
        "saldo",
        "date",
        "id_instituicao",
        "id_cartao",
        "contaObjetivo",
      ],
      include,
      where: {
        ...contaObjetivoObj,
        id_users: req.id,
      },
      group,
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
