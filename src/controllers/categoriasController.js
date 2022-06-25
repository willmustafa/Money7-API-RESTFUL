const Categorias = require('../models/CategoriasModel');

const getAll = (req, res) => {
  Categorias.findAll().then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const getOne = (req, res) => {
  Categorias.findByPk(req.params.id).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const setOne = (req, res) => {
  Categorias.create({
    nome: req.body.nome,
    cor: req.body.cor,
    icone: req.body.icone,
    id_users: req.body.id_users,
  }).then((response) => res.json(response));
};

const putOne = (req, res) => {
  Categorias.update({
    cartao: req.body.cartao,
    limite: req.body.limite,
    id_instituicao: req.body.id_instituicao,
  }, {
    where: {
      id_cartao: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const deleteOne = (req, res) => {
  Categorias.destroy({
    where: {
      id_cartao: req.params.id,
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
