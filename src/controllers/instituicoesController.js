const sequelize = require("sequelize");
const Instituicoes = require("../models/InstituicoesModel");

const getAll = async (req, res) => {
  await Instituicoes.findAll({
    attributes: ["id_instituicao", "nome", "cor", "icone"],
    where: {
      nome: {
        [sequelize.Op.ne]: "Objetivos",
      },
    },
    order: [["nome", "ASC"]],
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Instituicoes.findByPk(id)
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const setOne = async (req, res) => {
  const { nome, cor, icone } = req.body;
  if (!nome || !cor || !icone)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone",
    });

  await Instituicoes.create({
    nome,
    cor,
    icone,
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { nome, cor, icone } = req.body;
  if (!nome || !cor || !icone)
    return res.status(400).json({
      message: "Campos necessários: nome, cor, icone",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Instituicoes.update(
    {
      nome,
      cor,
      icone,
    },
    {
      where: {
        id_instituicao: id,
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

  await Instituicoes.destroy({
    where: {
      id_instituicao: id,
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
