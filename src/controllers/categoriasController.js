const Categorias = require("../models/CategoriasModel");

const getAll = async (req, res) => {
  await Categorias.findAll({
    order: [["nome", "ASC"]],
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Categorias.findByPk(id)
    .then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const setOne = async (req, res) => {
  const { nome, cor, icone, tipo, id_users } = req.body;
  if (!nome || !cor || !icone || !tipo || !id_users)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone, tipo, id_users",
    });

  await Categorias.create({
    nome,
    cor,
    icone,
    tipo,
    id_users,
  })
    .then((response) => res.json(response))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { nome, cor, icone, tipo, id_users } = req.body;
  if (!nome || !cor || !icone || !tipo || !id_users)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone, tipo, id_users",
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
        id_users,
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
