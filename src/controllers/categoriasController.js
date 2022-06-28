const Categorias = require('../models/CategoriasModel');

const getAll = (req, res) => {
  Categorias.findAll({
    order: [['tipo', 'ASC'], ['nome', 'ASC']]
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const getOne = (req, res) => {
  Categorias.findByPk(req.params.id).then((data) => res.json(data))
  .catch((error) => res.status(400).json(error));
};

const setOne = (req, res) => {
  Categorias.create({
    nome: req.body.nome,
    cor: req.body.cor,
    icone: req.body.icone,
    tipo: req.body.tipo,
    id_users: req.body.id_users,
  }).then((response) => res.json(response))
  .catch((error) => res.status(400).json(error));
};

const putOne = (req, res) => {
  Categorias.update({
    nome: req.body.nome,
    cor: req.body.cor,
    icone: req.body.icone,
    tipo: req.body.tipo,
  }, {
    where: {
      id_categoria: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const deleteOne = (req, res) => {
  Categorias.destroy({
    where: {
      id_categoria: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
};
