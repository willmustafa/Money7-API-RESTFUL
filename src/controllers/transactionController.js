const Sequelize = require('sequelize');
const Transactions = require('../models/TransactionModel');
const Categorias = require('../models/CategoriasModel');
const Contas = require('../models/ContasModel');
const Instituicoes = require('../models/InstituicoesModel');

const getAll = (req, res) => {
  Transactions.findAll({
    attributes: [
      'id',
      'valor',
      'descricao',
      'date',
    ],
    include: [
      {
        model: Categorias,
        attributes: ['id_categoria', 'nome', 'cor', 'icone'],
        as: 'categoria',
      },
      {
        model: Contas,
        as: 'conta',
        include: [{
          model: Instituicoes,
          attributes: ['id_instituicao', 'nome', 'cor', 'icone'],
          as: 'instituicao',
        }],
      }],
    where: {
        id_conta: {
          [Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
        }
    },
    order: [['date', 'DESC']]
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getOne = (req, res) => {
  Transactions.findByPk(
    req.params.id,
    {
      attributes: [
        'valor',
        'descricao',
        'date',
      ],
      include: [
        {
          model: Categorias,
          attributes: ['nome', 'cor', 'icone'],
          as: 'categoria',
        },
        {
          model: Contas,
          as: 'conta',
          include: [{
            model: Instituicoes,
            attributes: ['nome', 'cor', 'icone'],
            as: 'instituicao',
          }],
        }],
    },
  ).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const setOne = (req, res) => {
  Transactions.create({
    valor: req.body.valor,
    descricao: req.body.descricao,
    date: req.body.date,
    status: req.body.status,
    id_conta: req.body.id_conta,
    id_categoria: req.body.id_categoria,
    id_users: req.body.id_users,
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const putOne = (req, res) => {
  Transactions.update({
    valor: req.body.valor,
    descricao: req.body.descricao,
    date: req.body.date,
    status: req.body.status,
    id_conta: req.body.id_conta,
    id_categoria: req.body.id_categoria,
  }, {
    where: {
      id: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const deleteOne = (req, res) => {
  Transactions.destroy({
    where: {
      id: req.params.id,
    },
  }).then((data) => res.json(data))
    .catch((error) => res.status(400).json(error));
};

const getSomaMes = (req, res) => {
  Transactions.findAll({
    attributes: [
      [Sequelize.literal(`(SELECT 
      COALESCE(
          ROUND(
              (
                  (cur_sum - last_m_sum)/NULLIF(last_m_sum,0)
              )
              * 100
          ),0
      ) as despesa_perc_last FROM "Transactions" as tra
      LEFT JOIN (SELECT SUM(
              CASE WHEN EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM ('${req.query.date}'::date  - interval '1 month'))
          AND valor < 0
              THEN valor ELSE 0 END
              ) as last_m_sum FROM "Transactions") as last_m
              on last_m IS NOT NULL
      LEFT JOIN (SELECT SUM(
              CASE WHEN EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM '${req.query.date}'::date ) 
          AND valor < 0
              THEN valor ELSE 0 END
              ) as cur_sum FROM "Transactions") as cur
              on cur IS NOT NULL
              LIMIT 1)`), 'despesa_perc_last'],
      [Sequelize.literal(`(SELECT 
              COALESCE(
                  ROUND(
                      (
                          (cur_sum - last_m_sum)/NULLIF(last_m_sum,0)
                      )
                      * 100
                  ),0
              ) as receita_perc_last FROM "Transactions" as tra
                      LEFT JOIN (SELECT SUM(
                              CASE WHEN EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM ('${req.query.date}'::date - interval '1 month'))
                          AND valor >= 0
                              THEN valor ELSE 0 END
                              ) as last_m_sum FROM "Transactions") as last_m
                              on last_m IS NOT NULL
                      LEFT JOIN (SELECT SUM(
                              CASE WHEN EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM '${req.query.date}'::date ) 
                          AND valor >= 0
                              THEN valor ELSE 0 END
                              ) as cur_sum FROM "Transactions") as cur
                              on cur IS NOT NULL
                               LIMIT 1)`), 'receita_perc_last'],
      [Sequelize.literal(`SUM(CASE WHEN valor >= 0 AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM '${req.query.date}'::date ) 
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos")
      THEN valor ELSE 0 END)`), 'receita'],
      [Sequelize.literal(`SUM(CASE WHEN valor < 0 AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM '${req.query.date}'::date )
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END)`), 'despesa'],
      [Sequelize.literal(`(SELECT COALESCE(SUM(
        CASE WHEN "Contas"."date" <= '${req.query.date}' AND "Contas"."contaObjetivo" = false THEN saldo ELSE 0 END
        ),0) as saldo FROM "Contas")
        +
        (
          SELECT COALESCE(SUM(
              CASE WHEN "Transactions".date <= '${req.query.date}' AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END
          ),0) as saldo_contas FROM "Transactions"
      )`), 'saldo_atual'],
      [Sequelize.literal(`(SELECT COALESCE(SUM(
        CASE WHEN "Contas"."contaObjetivo" = false THEN saldo ELSE 0 END
        ),0) as saldo FROM "Contas")
        +
        (
          SELECT COALESCE(SUM(
              CASE WHEN "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END
          ),0) as saldo_contas FROM "Transactions"
      )`), 'saldo_total'],
    ],
    raw: true,
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getBalancoMensal = (req, res) => {
  Transactions.findAll({
    attributes: [
      [Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\'))'), 'date'],
      [Sequelize.fn('sum', Sequelize.col('valor')), 'saldo'],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          date: {
            [Sequelize.Op.lte]: req.query.date,
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
          }
        }
      ],
    },
    group: Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\')) '),
    order: Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\')) '),
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getGastosReceitasMensal = (req, res) => {
  Transactions.findAll({
    attributes: [
      [Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\'))'), 'date'],
      [Sequelize.literal('COALESCE(SUM(CASE WHEN valor >= 0 THEN valor ELSE 0 END),0)'), 'receita'],
      [Sequelize.literal('ABS(COALESCE(SUM(CASE WHEN valor < 0 THEN valor ELSE 0 END),0))'), 'despesa'],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          date: {
            [Sequelize.Op.lte]: req.query.date,
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
          }
        }
      ],
    },
    group: [
      Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\')) '),
    ],
    order: Sequelize.literal('TRIM(BOTH FROM TO_CHAR(date, \'TMMonth\')) '),
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getDespesaCategoria = (req, res) => {
  Transactions.findAll({
    attributes: [
      'id_categoria',
      [Sequelize.fn('sum', Sequelize.col('valor')), 'valor'],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          valor: {
            [Sequelize.Op.lt]: 0,
          },
        },
        {
          date: {
            [Sequelize.Op.lte]: req.query.date,
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
          }
        }
      ],
    },
    group: [
      'id_categoria',
    ],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getReceitaCategoria = (req, res) => {
  Transactions.findAll({
    attributes: [
      'id_categoria',
      [Sequelize.fn('sum', Sequelize.col('valor')), 'valor'],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          valor: {
            [Sequelize.Op.gte]: 0,
          },
        },
        {
          date: {
            [Sequelize.Op.lte]: req.query.date,
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
          }
        }
      ],
    },
    group: [
      'id_categoria',
    ],
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

const getPendencias = (req, res) => {
  Transactions.findAll({
    attributes: [
      [Sequelize.literal('COALESCE(SUM(CASE WHEN valor >= 0 THEN valor ELSE 0 END),0)'), 'receita'],
      [Sequelize.literal('COALESCE(SUM(CASE WHEN valor < 0 THEN valor ELSE 0 END),0)'), 'despesa'],
    ],
    where: {
      status: {
        [Sequelize.Op.eq]: false,
      },
    },
  }).then((data) => res.json(data))
    .catch((err) => res.json(err));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
  getSomaMes,
  getBalancoMensal,
  getGastosReceitasMensal,
  getDespesaCategoria,
  getReceitaCategoria,
  getPendencias,
};
