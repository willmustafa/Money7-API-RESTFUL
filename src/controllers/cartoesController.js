const Cartoes = require('../models/CartoesModel');
const Instituicoes = require('../models/InstituicoesModel');
const Contas = require('../models/ContasModel');
const sequelize = require('sequelize');

const getAll = (req, res) => {
  Contas.findAll({
    attributes: [
      'id_conta',
      'id_instituicao',
      'id_cartao',
      [sequelize.literal(`(
      SELECT ABS(COALESCE(SUM(
          CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
          AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
          AND "Transactions".id_conta = "Contas".id_conta THEN valor ELSE 0 END
      ),0)) as saldo_contas FROM "Transactions"
      )`), 'saldo_atual']
    ],
    include: [{
          model: Instituicoes,
          attributes: ['nome', 'cor', 'icone'],
          as: 'instituicao',
        },
        {
          model: Cartoes,
          attributes: ['limite', 'vencimento', 'fechamento'],
          as: 'cartao',
        }],
    where: {
      id_cartao: {
        [sequelize.Op.ne]: null
      }
    }
  }).then((data) => res.json(data))
    .catch((err) => res.status(400).json(err));



  // Cartoes.findAll({
  //   attributes: ['id_cartao', 'limite', 'vencimento', 'fechamento', 'id_instituicao',
  //   [sequelize.literal(`(
  //     SELECT COALESCE(SUM(
  //         CASE WHEN "Transactions".date <= '${req.query.date}' AND "Transactions".id_cartao = "Cartoes".id_cartao THEN valor ELSE 0 END
  //     ),0) as saldo_contas FROM "Transactions"
  // )`), 'saldo_atual']
  // ],
  //   include: [{
  //     model: Instituicoes,
  //     attributes: ['nome', 'cor', 'icone'],
  //     as: 'instituicao',
  //   }],
  // }).then((data) => res.json(data))
  //   .catch((err) => res.status(400).json(err));
};

const getOne = (req, res) => {
  Cartoes.findByPk(req.params.id).then((data) => res.json(data))
    .catch((err) => res.status(400).json(err));
};

const setOne = (req, res) => {
  Cartoes.create({
    vencimento: req.body.vencimento,
    fechamento: req.body.fechamento,
    limite: req.body.limite,
    id_instituicao: req.body.id_instituicao,
    id_users: req.body.id_users,
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const putOne = (req, res) => {
  Cartoes.update({
    vencimento: req.body.vencimento,
    fechamento: req.body.fechamento,
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
  Cartoes.destroy({
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
