const Sequelize = require('sequelize');
const Contas = require('../models/ContasModel');
const Instituicoes = require('../models/InstituicoesModel');

const getAll = (req, res) => {
  Contas.findAll({
    attributes: [
      'id_conta',
      'saldo',
      'date',
      'id_instituicao',
    ],
    include: [{
      model: Instituicoes,
      attributes: ['nome', 'cor', 'icone'],
      as: 'instituicao',
    }],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getOne = (req, res) => {
  Contas.findByPk(
    req.params.id,
    {
      attributes: [
        'id_conta',
        'saldo',
        'date',
        'id_instituicao',
      ],
      include: [{
        model: Instituicoes,
        attributes: ['nome', 'cor', 'icone'],
        as: 'instituicao',
      }],
    },
  ).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const setOne = (req, res) => {
  Contas.create({
    saldo: req.body.saldo,
    date: req.body.date,
    id_instituicao: req.body.id_instituicao,
    id_users: req.body.id_users,
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const putOne = (req, res) => {
  Contas.update({
    saldo: req.body.saldo,
    date: req.body.date,
    id_instituicao: req.body.id_instituicao,
  }, {
    where: {
      id_conta: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const deleteOne = (req, res) => {
  Contas.destroy({
    where: {
      id_conta: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.json(error));
};

const getSaldoAtualPrevisto = (req, res) => {
  Contas.findAll({
    attributes: [
      'id_conta',
      'date',
      'saldo',
      'id_instituicao',
      [Sequelize.literal(`SUM(
            CASE WHEN "Contas"."date" <= '${req.query.date}' THEN saldo ELSE 0 END
            )
            +
            (
                SELECT COALESCE(SUM(
                    CASE WHEN "Transactions".date <= '${req.query.date}' THEN valor ELSE 0 END
                ),0) as saldo_contas FROM "Transactions"
            )
            `), 'saldo_atual'],
    ],
    include: [{
      model: Instituicoes,
      attributes: ['nome', 'cor', 'icone'],
      as: 'instituicao',
    }],
    group: ['id_conta', 'instituicao.id_instituicao'],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getAllInstituicoes = (req, res) => {
  Instituicoes.findAll().then((data) => res.json(data))
    .catch((err) => res.json(err));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
  getSaldoAtualPrevisto,
  getAllInstituicoes,
};
