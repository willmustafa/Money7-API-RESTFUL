const Sequelize = require('sequelize')
const Transactions = require('../models/TransactionModel')
const Categorias = require('../models/CategoriasModel')
const Contas = require('../models/ContasModel')
const Instituicoes = require('../models/InstituicoesModel')
const { MonthsBefore } = require('../utils/date-format')
const database = require('../database/index')

const getAll = async (req, res) => {
	const { date } = req.query
	if(!date) return res.status(400).json({ 'message': 'Date is required.' })

	database.query(`SELECT "Transactions"."id", "Transactions"."valor", "Transactions"."descricao", 
	"Transactions"."date", "categoria"."id_categoria" AS "categoria.id_categoria",
	"objetivo".titulo,
	"objetivo".id_categoria,
	"objetivo".cor, 
	"categoria"."nome" AS "categoria.nome", "categoria"."cor" AS "categoria.cor", 
	"categoria"."icone" AS "categoria.icone", "conta"."id_conta" AS "conta.id_conta", 
	"conta"."saldo" AS "conta.saldo", "conta"."date" AS "conta.date", 
	"conta"."contaObjetivo" AS "conta.contaObjetivo", "conta"."createdAt" AS "conta.createdAt", 
	"conta"."updatedAt" AS "conta.updatedAt", "conta"."id_instituicao" AS "conta.id_instituicao", 
	"conta"."id_users" AS "conta.id_users", "conta"."id_cartao" AS "conta.id_cartao", 
	"conta->instituicao"."id_instituicao" AS "conta.instituicao.id_instituicao", 
	"conta->instituicao"."nome" AS "conta.instituicao.nome", 
	"conta->instituicao"."cor" AS "conta.instituicao.cor", 
	"conta->instituicao"."icone" AS "conta.instituicao.icone" FROM "Transactions" AS "Transactions" 
	LEFT OUTER JOIN "Categorias" AS "categoria" ON "Transactions"."id_categoria" = "categoria"."id_categoria" 
	LEFT OUTER JOIN "Contas" AS "conta" ON "Transactions"."id_conta" = "conta"."id_conta" 
	LEFT OUTER JOIN "Instituicoes" AS "conta->instituicao" ON "conta"."id_instituicao" = "conta->instituicao"."id_instituicao"
	LEFT OUTER JOIN "Objetivos" AS "objetivo" ON "objetivo".id_conta = "Transactions".id_conta
	WHERE (date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
		   AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}')) 
	ORDER BY "Transactions"."date" DESC;`, { type: Sequelize.QueryTypes.SELECT }).then((data) => res.json(data))
		.catch((err) => res.json(err))
}

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
		.catch((err) => res.json(err))
}

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
		.catch((error) => res.status(400).json(error))
}

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
		.catch((error) => res.status(400).json(error))
}

const deleteOne = (req, res) => {
	Transactions.destroy({
		where: {
			id: req.params.id,
		},
	}).then((data) => res.json(data))
		.catch((error) => res.status(400).json(error))
}

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
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(req.query.date,1)}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(req.query.date,1)}') 
          AND valor < 0
              THEN valor ELSE 0 END
              ) as last_m_sum FROM "Transactions") as last_m
              on last_m IS NOT NULL
      LEFT JOIN (SELECT SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
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
                              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(req.query.date,1)}') 
                              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(req.query.date,1)}') 
                          AND valor >= 0
                              THEN valor ELSE 0 END
                              ) as last_m_sum FROM "Transactions") as last_m
                              on last_m IS NOT NULL
                      LEFT JOIN (SELECT SUM(
                              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
                              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
                          AND valor >= 0
                              THEN valor ELSE 0 END
                              ) as cur_sum FROM "Transactions") as cur
                              on cur IS NOT NULL
                               LIMIT 1)`), 'receita_perc_last'],
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
					CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(req.query.date,1)}') 
					AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(req.query.date,1)}') 
					THEN valor ELSE 0 END
					) as last_m_sum FROM "Transactions") as last_m
					on last_m IS NOT NULL
			LEFT JOIN (SELECT SUM(
					CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
					AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
					THEN valor ELSE 0 END
					) as cur_sum FROM "Transactions") as cur
					on cur IS NOT NULL
					LIMIT 1)`), 'balanco_perc_last'],
			[Sequelize.literal(`SUM(CASE WHEN valor >= 0 AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
          AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos")
      THEN valor ELSE 0 END)`), 'receita'],
			[Sequelize.literal(`SUM(CASE WHEN valor < 0 AND date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
      AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END)`), 'despesa'],
			[Sequelize.literal(`(COALESCE(SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') 
              AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END
          ),0))`), 'saldo_atual'],
			[Sequelize.literal(`(SELECT COALESCE(SUM(
        CASE WHEN "Contas"."contaObjetivo" = false THEN saldo ELSE 0 END
        ),0) as saldo FROM "Contas")
        +
        (
          SELECT COALESCE(SUM(
              CASE WHEN "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
              "Transactions".id_conta not in (SELECT id_conta FROM "Contas" WHERE "Contas"."id_cartao" IS NOT NULL)
			  AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos")
              THEN valor ELSE 0 END
          ),0) as saldo_contas FROM "Transactions"
      )`), 'saldo_total'],
		],
		raw: true,
	}).then((data) => res.json(data))
		.catch((err) => res.json(err))
}

const getBalancoMensal = (req, res) => {
	Transactions.findAll({
		attributes: [
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'YYYY\')'), 'year'],
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'Mon\')'), 'month'],
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'MM\')'), 'month_number'],
			[Sequelize.literal('ROUND(CAST(SUM(valor) as numeric),2)'), 'saldo'],
		],
		where: {
			[Sequelize.Op.and]: [
				{
					date: {
						[Sequelize.Op.lte]: req.query.date,
					},
				},
				{
					date: {
						[Sequelize.Op.gte]: MonthsBefore(req.query.date, 12),
					},
				},
				{
					id_conta: {
						[Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
					}
				}
			],
		},
		group: Sequelize.literal('date_trunc(\'month\', date)'),
		order: Sequelize.literal('1,3')
	}).then((data) => res.json(data))
		.catch((err) => res.json(err))
}

const getGastosReceitasMensal = (req, res) => {
	Transactions.findAll({
		attributes: [
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'YYYY\')'), 'year'],
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'Mon\')'), 'month'],
			[Sequelize.literal('to_char(date_trunc(\'month\', date), \'MM\')'), 'month_number'],
			[Sequelize.literal('COALESCE(ROUND(CAST(SUM(CASE WHEN valor >= 0 THEN valor ELSE 0 END) as numeric),2),0)'), 'receita'],
			[Sequelize.literal('ABS(COALESCE(ROUND(CAST(SUM(CASE WHEN valor < 0 THEN valor ELSE 0 END) as numeric) ,2),0))'), 'despesa'],
		],
		where: {
			[Sequelize.Op.and]: [
				{
					date: {
						[Sequelize.Op.lte]: req.query.date,
					},
				},
				{
					date: {
						[Sequelize.Op.gte]: MonthsBefore(req.query.date, 12),
					},
				},
				{
					id_conta: {
						[Sequelize.Op.notIn]: Sequelize.literal('(SELECT id_conta FROM "Objetivos")')
					}
				}
			],
		},
		group: Sequelize.literal('date_trunc(\'month\', date)'),
		order: Sequelize.literal('1,3')
	}).then((data) => res.json(data))
		.catch((err) => res.json(err))
}

const getDespesaCategoria = (req, res) => {
	Transactions.findAll({
		attributes: [
			'id_categoria',
			[Sequelize.literal(`
      COALESCE(SUM(
        CASE WHEN 
        "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') AND
        date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') AND
        "Transactions".valor < 0
        THEN valor ELSE 0 END
      ),0)
      `), 'valor']
		],
		include: [
			{
				model: Categorias,
				attributes: ['nome'],
				as: 'categoria',
			}
		],
		group: [
			'Transactions.id_categoria',
			'categoria.id_categoria'
		],
	}).then((data) => res.json(data))
		.catch((err) => res.status(400).json(err))
}

const getReceitaCategoria = (req, res) => {
	Transactions.findAll({
		attributes: [
			'id_categoria',
			[Sequelize.literal(`
      COALESCE(SUM(
        CASE WHEN 
        "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${req.query.date}') AND
        date_part('year', "Transactions".date) = date_part('year', timestamp '${req.query.date}') AND
        "Transactions".valor > 0
        THEN valor ELSE 0 END
      ),0)
      `), 'valor']
		],
		include: [
			{
				model: Categorias,
				attributes: ['nome'],
				as: 'categoria',
			}
		],
		group: [
			'Transactions.id_categoria',
			'categoria.id_categoria'
		],
	}).then((data) => res.json(data))
		.catch((err) => res.json(err))
}

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
		.catch((err) => res.json(err))
}

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
}
