const Objetivos = require('../models/ObjetivosModel');
const Categorias = require('../models/CategoriasModel');
const Contas = require('../models/ContasModel');
const sequelize = require('sequelize');

const getAll = (req, res) => {
  Objetivos.findAll({
    attributes: ['id_objetivo', 'titulo', 'cor', 'valor_total', 'date', 'id_categoria', 'description',
    [sequelize.literal(`(
      SELECT COALESCE(SUM(
          CASE WHEN "Transactions".date <= '${req.query.date}' AND "Transactions".id_conta = "Objetivos".id_conta THEN valor ELSE 0 END
      ),0) as saldo_contas FROM "Transactions"
    )`), 'saldo_atual']
  ],
    include: [
      {
        model: Categorias,
        attributes: ['nome', 'cor', 'icone'],
        as: 'categoria',
      }],
  }).then((data) => res.json(data))
  .catch((err) => res.status(400).json(err));
};

const getOne = (req, res) => {
  Objetivos.findByPk(
    req.params.id,
    {
      attributes: ['id_objetivo', 'titulo', 'cor', 'icone', 'valor_total', 'date', 'id_categoria', 'description'],
      include: [
        {
          model: Categorias,
          attributes: ['nome', 'cor', 'icone'],
          as: 'categoria',
        }],
    },
  ).then((data) => res.json(data))
  .catch((err) => res.status(400).json(err));
};

const setOne = (req, res) => {
  console.log(req.body)
  Contas.create({
    saldo: 0,
    id_instituicao: 9999,
    contaObjetivo: true,
    id_users: req.body.id_users,
  }).then(data => {
    Objetivos.create({
      titulo: req.body.titulo,
      cor: req.body.cor,
      valor_total: req.body.valor,
      date: req.body.date,
      description: req.body.description,
      id_categoria: req.body.id_categoria,
      id_conta: data.dataValues.id_conta,
      id_users: req.body.id_users,
    })
  }).then((data) => res.json(data))
  .catch((err) => res.status(400).json(err));
};

const putOne = (req, res) => {
  Objetivos.update({
    titulo: req.body.titulo,
    cor: req.body.cor,
    valor_total: req.body.valor_total,
    description: req.body.description,
    date: req.body.date,
    id_categoria: req.body.id_categoria,
  }, {
    where: {
      id_objetivo: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const deleteOne = (req, res) => {
  Objetivos.destroy({
    where: {
      id_objetivo: req.params.id,
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
