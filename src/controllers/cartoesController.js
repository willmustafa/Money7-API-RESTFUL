const Cartoes = require('../models/CartoesModel');
const Instituicoes = require('../models/InstituicoesModel');

const getAll = (req, res) => {
  Cartoes.findAll({
    attributes: ['id_cartao', 'cartao', 'limite', 'vencimento'],
    include: [{
      model: Instituicoes,
      attributes: ['nome', 'cor', 'icone'],
      as: 'instituicao',
    }],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getOne = (req, res) => {
  Cartoes.findByPk(req.params.id).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const setOne = (req, res) => {
  Cartoes.create({
    cartao: req.body.cartao,
    limite: req.body.limite,
    id_instituicao: req.body.id_instituicao,
    id_users: req.body.id_users,
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const putOne = (req, res) => {
  Cartoes.update({
    cartao: req.body.cartao,
    limite: req.body.limite,
    id_instituicao: req.body.id_instituicao,
  }, {
    where: {
      id_cartao: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const deleteOne = (req, res) => {
  Cartoes.destroy({
    where: {
      id_cartao: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
};
