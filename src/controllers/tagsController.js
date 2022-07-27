const Tags = require("../models/TagsModel");
const Sequelize = require("sequelize");

const getAll = async (req, res) => {
  await Tags.findAll({
    order: [["nome", "ASC"]],
    where: {
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Tags.findByPk(id, {
    where: {
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const setOne = async (req, res) => {
  const { nome } = req.body;
  if (!nome)
    return res.status(400).json({
      message: "Campos necessários: nome",
    });

  const existentes = await Tags.findAll({
    where: {
      nome: {
        [Sequelize.Op.iLike]: nome,
      },
    },
  });

  if (existentes.length > 0) {
    return res.status(400).json({ message: "Já existe" });
  }

  await Tags.create({
    nome,
    id_users: req.id,
  })
    .then((response) => res.json(response))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { nome } = req.body;
  if (!nome)
    return res.status(400).json({
      message: "Campos necessários: nome",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

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
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const deleteOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Tags.destroy({
    where: {
      id,
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
};
