const Objetivos = require('../models/ObjetivosModel');
const Categorias = require('../models/CategoriasModel');

const getAll = (req, res) => {
  Objetivos.findAll({
    attributes: ['id_objetivo', 'titulo', 'cor', 'icone', 'valor_total', 'date'],
    include: [
      {
        model: Categorias,
        attributes: ['nome', 'cor', 'icone'],
        as: 'categoria',
      }],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getOne = (req, res) => {
  Objetivos.findByPk(
    req.params.id,
    {
      attributes: ['id_objetivo', 'titulo', 'cor', 'icone', 'valor_total', 'date'],
      include: [
        {
          model: Categorias,
          attributes: ['nome', 'cor', 'icone'],
          as: 'categoria',
        }],
    },
  ).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const setOne = (req, res) => {
  Objetivos.create({
    titulo: req.body.titulo,
    cor: req.body.cor,
    icone: req.body.icone,
    valor_total: req.body.valor_total,
    date: req.body.date,
    id_categoria: req.body.id_categoria,
    id_users: req.body.id_users,
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const putOne = (req, res) => {
  Objetivos.update({
    titulo: req.body.titulo,
    cor: req.body.cor,
    icone: req.body.icone,
    valor_total: req.body.valor_total,
    date: req.body.date,
    id_categoria: req.body.id_categoria,
  }, {
    where: {
      id_objetivo: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const deleteOne = (req, res) => {
  Objetivos.destroy({
    where: {
      id_objetivo: req.params.id,
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
