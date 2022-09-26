const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Tags = require("../../models/TagsModel");

module.exports = async (req, res, next) => {
  let nome = req.bodyString("nome").toLowerCase();

  if (!nome)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: nome",
    });

  const id = req.paramString("id");

  if (!id)
    return res.status(BAD_REQUEST).json({
      message: "O id deve ser passado na url.",
    });

  try {
    await Tags.update(
      {
        nome,
      },
      {
        where: {
          id,
          id_users: req.id,
        },
      }
    )
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
