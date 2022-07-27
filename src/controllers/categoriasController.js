const Categorias = require("../models/CategoriasModel");
const Sequelize = require("sequelize");

const getAll = async (req, res) => {
  await Categorias.findAll({
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

  await Categorias.findByPk(id, {
    where: {
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const setOne = async (req, res) => {
  const { nome, cor, icone, tipo } = req.body;
  if (!nome || !cor || !icone || !tipo)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone, tipo",
    });

  const existentes = await Categorias.findAll({
    where: {
      nome: {
        [Sequelize.Op.iLike]: nome,
      },
    },
  });

  if (existentes.length > 0) {
    return res.status(400).json({ message: "Já existe" });
  }

  await Categorias.create({
    nome,
    cor,
    icone,
    tipo,
    id_users: req.id,
  })
    .then((response) => res.json(response))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { nome, cor, icone, tipo } = req.body;
  if (!nome || !cor || !icone || !tipo)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone, tipo",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Categorias.update(
    {
      nome,
      cor,
      icone,
      tipo,
    },
    {
      where: {
        id_categoria: id,
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

  await Categorias.destroy({
    where: {
      id_categoria: id,
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
