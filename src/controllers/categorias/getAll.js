const { CREATED, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Categorias = require("../../models/CategoriasModel");

module.exports = async (req, res, next) => {
  try {
    await Categorias.findAll({
      order: [["nome", "ASC"]],
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
