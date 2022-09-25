const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;
const Sequelize = require("sequelize");

const Instituicoes = require("../../models/InstituicoesModel");

module.exports = async (req, res, next) => {
  try {
    await Instituicoes.findAll({
      attributes: ["id_instituicao", "nome", "cor", "icone"],
      where: {
        nome: {
          [Sequelize.Op.ne]: "Objetivos",
        },
      },
      order: [["nome", "ASC"]],
    })
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
