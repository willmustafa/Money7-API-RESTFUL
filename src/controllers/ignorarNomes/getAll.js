const { OK, INTERNAL_SERVER_ERROR } = require("http-status-codes").StatusCodes;

const IgnorarNomes = require("../../models/IgnorarNomesModel");

module.exports = async (req, res, next) => {
  const nome = req.queryString("nome")?.toLowerCase();
  let where = nome ? { nome: nome } : {};

  try {
    await IgnorarNomes.findAll({
      order: [["nome", "ASC"]],
      where: {
        id_users: req.id,
        ...where,
      },
    })
      .then((data) => res.status(OK).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
