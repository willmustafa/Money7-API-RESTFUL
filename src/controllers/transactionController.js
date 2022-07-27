const Sequelize = require("sequelize");
const Transactions = require("../models/TransactionModel");
const Categorias = require("../models/CategoriasModel");
const Contas = require("../models/ContasModel");
const Instituicoes = require("../models/InstituicoesModel");
const { MonthsBefore } = require("../utils/date-format");
const database = require("../database/index");
const { changeNullToZero, percentage_from } = require("../utils/numberUtils");

const getAll = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Date is required." });

  await database
    .query(
      `SELECT "Transactions"."id", "Transactions"."valor", "Transactions"."descricao", 
	"Transactions"."date", "categoria"."id_categoria" AS "categoria.id_categoria",
  "Transactions"."id_tag",
  "tag"."nome" AS "tag_nome",
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
  LEFT OUTER JOIN "Tags" as "tag" ON "Transactions"."id_tag" = "tag"."id"
	LEFT OUTER JOIN "Contas" AS "conta" ON "Transactions"."id_conta" = "conta"."id_conta" 
	LEFT OUTER JOIN "Instituicoes" AS "conta->instituicao" ON "conta"."id_instituicao" = "conta->instituicao"."id_instituicao"
	LEFT OUTER JOIN "Objetivos" AS "objetivo" ON "objetivo".id_conta = "Transactions".id_conta
	WHERE (date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
		   AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}')) 
       AND "Transactions".id_users = '${req.id}' 
	ORDER BY "Transactions"."date" DESC;`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Transactions.findByPk(id, {
    attributes: ["valor", "descricao", "date"],
    include: [
      {
        model: Categorias,
        attributes: ["nome", "cor", "icone"],
        as: "categoria",
      },
      {
        model: Contas,
        as: "conta",
        include: [
          {
            model: Instituicoes,
            attributes: ["nome", "cor", "icone"],
            as: "instituicao",
          },
        ],
      },
    ],
    where: {
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const setOne = async (req, res) => {
  let {
    status,
    id_conta,
    valor,
    date,
    descricao,
    id_categoria,
    id_conta2,
    tag,
  } = req.body;
  // if (!id_conta || valor !== undefined || !date || !descricao || !id_categoria)
  //   return res.status(400).json({
  //     message:
  //       "Campos necessários: status, id_conta, valor, date, descricao, id_categoria",
  //   });

  if (id_conta2) {
    await createTransferencia(req, res);
  } else {
    if (
      id_categoria == "dinheiro resgatado" ||
      id_categoria == "dinheiro guardado"
    )
      await Categorias.findOne({
        attributes: ["id_categoria"],
        where: {
          nome: id_categoria,
        },
      }).then(async (data) => {
        if (data) id_categoria = data.dataValues.id_categoria;

        if (!data)
          await Categorias.create({
            nome: id_categoria,
            tipo: "Não Contabilizar",
            cor: "bg-dark",
            icone: "dollar-sign",
          }).then((dataC) => (id_categoria = dataC.dataValues.id_categoria));
      });

    let dados = {
      valor,
      descricao,
      date,
      status,
      id_conta,
      id_categoria,
      id_users: req.id,
    };

    if (tag) dados.id_tag = tag;

    await Transactions.create(dados)
      .then((data) => res.json(data))
      .catch((error) => res.status(204).json(error));
  }
};

const createTransferencia = async (req, res) => {
  let { status, id_conta, valor, date, id_conta2 } = req.body;

  let categorias = await Categorias.findAll({
    attributes: ["id_categoria", "nome"],
    where: {
      nome: {
        [Sequelize.Op.or]: ["transferência enviada", "transferência recebida"],
      },
    },
    raw: true,
  });

  let contaObjetivo = await Contas.findAll({
    where: {
      contaObjetivo: true,
      id_conta: {
        [Sequelize.Op.or]: [id_conta, id_conta2],
      },
    },
    raw: true,
  });

  if (categorias.length == 2) {
    await Transactions.create({
      valor: valor * -1,
      descricao: "Transferência",
      date,
      status,
      id_conta,
      id_categoria: categorias.filter(
        (el) => el.nome == "transferência enviada"
      )[0].id_categoria,
      id_users: req.id,
      objetivo: contaObjetivo.length > 0 ? true : false,
    });

    await Transactions.create({
      valor,
      descricao: "Transferência",
      date,
      status,
      id_conta: id_conta2,
      id_categoria: categorias.filter(
        (el) => el.nome == "transferência recebida"
      )[0].id_categoria,
      id_users: req.id,
      objetivo: contaObjetivo.length > 0 ? true : false,
    }).then((data) => res.json(data));
  }
};

const putOne = async (req, res) => {
  const { status, id_conta, valor, date, descricao, id_categoria, tag } =
    req.body;
  if (!status || !id_conta || !valor || !date || !descricao || !id_categoria)
    return res.status(400).json({
      message:
        "Campos necessários: status, id_conta, valor, date, descricao, id_categoria",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Transactions.update(
    {
      valor,
      descricao,
      date,
      status,
      id_conta,
      id_categoria,
      id_tag: tag ? tag : null,
    },
    {
      where: {
        id,
        id_users: req.id,
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

  await Transactions.destroy({
    where: {
      id,
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const getSomaMes = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      [
        Sequelize.literal(`(SELECT 
      COALESCE(
          ROUND(
              (
                (ABS(cur_sum) - ABS(last_m_sum))/NULLIF(ABS(last_m_sum),0)
              )
              * 100
          ),0
      ) as despesa_perc_last FROM "Transactions" as tra
      LEFT JOIN (SELECT SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(
                date,
                1
              )}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(
                date,
                1
              )}') 
              AND valor < 0
              AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
              AND "Transactions".id_users = '${req.id}' 
              AND "Transactions".objetivo = false
              AND "Transactions".descricao <> 'Pagamento de fatura' 
              THEN valor ELSE 0 END
              ) as last_m_sum FROM "Transactions") as last_m
              on last_m IS NOT NULL
      LEFT JOIN (SELECT SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
              AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
              AND valor < 0 
              AND "Transactions".descricao <> 'Pagamento de fatura' 
              AND "Transactions".objetivo = false
              AND "Transactions".id_users = '${req.id}' 
              THEN valor ELSE 0 END
              ) as cur_sum FROM "Transactions") as cur
              on cur IS NOT NULL
              LIMIT 1)`),
        "despesa_perc_last",
      ],
      [
        Sequelize.literal(`(SELECT 
              COALESCE(
                  ROUND(
                      (
                          (ABS(cur_sum) - ABS(last_m_sum))/NULLIF(ABS(last_m_sum),0)
                      )
                      * 100
                  ),0
              ) as receita_perc_last FROM "Transactions" as tra
                      LEFT JOIN (SELECT SUM(
                              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(
                                date,
                                1
                              )}') 
                              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(
                                date,
                                1
                              )}') 
                          AND valor >= 0 
                          AND "Transactions".objetivo = false
                          AND "Transactions".descricao <> 'Pagamento de fatura' 
                          AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
                          AND "Transactions".id_users = '${req.id}' 
                              THEN valor ELSE 0 END
                              ) as last_m_sum FROM "Transactions") as last_m
                              on last_m IS NOT NULL
                      LEFT JOIN (SELECT SUM(
                              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
                              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
                          AND valor >= 0
                          AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
                          AND "Transactions".id_users = '${req.id}' 
                          AND "Transactions".objetivo = false
                          AND "Transactions".descricao <> 'Pagamento de fatura' 
                              THEN valor ELSE 0 END
                              ) as cur_sum FROM "Transactions") as cur
                              on cur IS NOT NULL
                               LIMIT 1)`),
        "receita_perc_last",
      ],
      [
        Sequelize.literal(`(SELECT 
			COALESCE(
				ROUND(
					(
						(cur_sum - last_m_sum)/NULLIF(last_m_sum,0)
					)
					* 100
				),0
			) as despesa_perc_last FROM "Transactions" as tra
			LEFT JOIN (SELECT SUM(
					CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${MonthsBefore(
            date,
            1
          )}') 
					AND date_part('year', "Transactions".date) = date_part('year', timestamp '${MonthsBefore(
            date,
            1
          )}') 
          AND "Transactions".id_users = '${req.id}' 
          AND "Transactions".objetivo = false
          AND "Transactions".descricao <> 'Pagamento de fatura' 
          AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
					THEN valor ELSE 0 END
					) as last_m_sum FROM "Transactions") as last_m
					on last_m IS NOT NULL
			LEFT JOIN (SELECT SUM(
					CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
					AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
          AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
          AND "Transactions".id_users = '${req.id}' 
          AND "Transactions".objetivo = false
          AND "Transactions".descricao <> 'Pagamento de fatura' 
					THEN valor ELSE 0 END
					) as cur_sum FROM "Transactions") as cur
					on cur IS NOT NULL
					LIMIT 1)`),
        "balanco_perc_last",
      ],
      [
        Sequelize.literal(`SUM(CASE WHEN valor >= 0 AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
          AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos")
      AND "Transactions".id_users = '${req.id}' 
      AND "Transactions".objetivo = false
      AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
      THEN valor ELSE 0 END)`),
        "receita",
      ],
      [
        Sequelize.literal(`ABS(SUM(CASE WHEN valor < 0 AND date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
      AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
      AND "Transactions".id_users = '${req.id}' 
      AND "Transactions".objetivo = false
      AND "Transactions".descricao <> 'Pagamento de fatura' 
      AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END))`),
        "despesa",
      ],
      [
        Sequelize.literal(`COALESCE(SUM(
              CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
              AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
              AND "Transactions".id_users = '${req.id}' 
              AND "Transactions".objetivo = false 
              AND "Transactions".descricao <> 'Pagamento de fatura' 
              AND "Transactions".id_categoria NOT IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')
              AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END
          ),0)`),
        "saldo_atual",
      ],
      [
        Sequelize.literal(`(SELECT COALESCE(SUM(
        CASE WHEN "Contas"."contaObjetivo" = false 
        AND "Contas".id_cartao IS NULL
        THEN saldo ELSE 0 END
        ),0) as saldo FROM "Contas")
        +
        (
          SELECT COALESCE(SUM(
              CASE WHEN "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
              "Transactions".id_conta not in (SELECT id_conta FROM "Contas" WHERE "Contas"."id_cartao" IS NOT NULL)
              AND "Transactions".id_users = '${req.id}' 
              AND "Transactions".objetivo = false
              THEN valor ELSE 0 END
          ),0) as saldo_contas FROM "Transactions"
      )`),
        "saldo_total",
      ],
    ],
    raw: true,
  })
    .then((data) => {
      res.json(data.map((el) => changeNullToZero(el)));
    })
    .catch((err) => res.status(204).json(err));
};

const getBalancoMensal = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      [Sequelize.literal("to_char(date_trunc('month', date), 'YYYY')"), "year"],
      [Sequelize.literal("to_char(date_trunc('month', date), 'Mon')"), "month"],
      [
        Sequelize.literal("to_char(date_trunc('month', date), 'MM')"),
        "month_number",
      ],
      [Sequelize.literal("ROUND(CAST(SUM(valor) as numeric),2)"), "saldo"],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          objetivo: false,
        },
        {
          descricao: {
            [Sequelize.Op.ne]: "Pagamento de fatura",
          },
        },
        {
          date: {
            [Sequelize.Op.lte]: date,
          },
        },
        {
          date: {
            [Sequelize.Op.gte]: MonthsBefore(date, 12),
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal(
              '(SELECT id_conta FROM "Objetivos")'
            ),
          },
        },
        {
          id_users: req.id,
        },
        {
          id_categoria: {
            [Sequelize.Op.notIn]: Sequelize.literal(
              `(SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')`
            ),
          },
        },
      ],
    },
    group: Sequelize.literal("date_trunc('month', date)"),
    order: Sequelize.literal("1,3"),
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getGastosReceitasMensal = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      [Sequelize.literal("to_char(date_trunc('month', date), 'YYYY')"), "year"],
      [Sequelize.literal("to_char(date_trunc('month', date), 'Mon')"), "month"],
      [
        Sequelize.literal("to_char(date_trunc('month', date), 'MM')"),
        "month_number",
      ],
      [
        Sequelize.literal(
          `COALESCE(ROUND(CAST(SUM(CASE WHEN valor >= 0 AND "Transactions".id_users = '${req.id}' AND "Transactions".objetivo = false THEN valor ELSE 0 END) as numeric),2),0)`
        ),
        "receita",
      ],
      [
        Sequelize.literal(
          `ABS(COALESCE(ROUND(CAST(SUM(CASE WHEN valor < 0AND "Transactions".id_users = '${req.id}' AND "Transactions".objetivo = false THEN valor ELSE 0 END) as numeric) ,2),0))`
        ),
        "despesa",
      ],
    ],
    where: {
      [Sequelize.Op.and]: [
        {
          objetivo: false,
        },
        {
          date: {
            [Sequelize.Op.lte]: date,
          },
        },
        {
          descricao: {
            [Sequelize.Op.ne]: "Pagamento de fatura",
          },
        },
        {
          date: {
            [Sequelize.Op.gte]: MonthsBefore(date, 12),
          },
        },
        {
          id_conta: {
            [Sequelize.Op.notIn]: Sequelize.literal(
              '(SELECT id_conta FROM "Objetivos")'
            ),
          },
        },
        {
          id_users: req.id,
        },
        {
          id_categoria: {
            [Sequelize.Op.notIn]: Sequelize.literal(
              `(SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')`
            ),
          },
        },
      ],
    },
    group: Sequelize.literal("date_trunc('month', date)"),
    order: Sequelize.literal("1,3"),
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getDespesaCategoria = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      "id_categoria",
      [
        Sequelize.literal(`
      COALESCE(SUM(
        CASE WHEN 
        "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') AND
        date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') AND
        "Transactions".valor < 0 
        AND "Transactions".descricao <> 'Pagamento de fatura' 
        AND "Transactions".objetivo = false 
        AND "Transactions".id_users = '${req.id}' 
        THEN valor ELSE 0 END
      ),0)
      `),
        "valor",
      ],
    ],
    include: [
      {
        model: Categorias,
        attributes: ["nome"],
        as: "categoria",
      },
    ],
    where: {
      id_users: req.id,
      descricao: {
        [Sequelize.Op.ne]: "Pagamento de fatura",
      },
      id_categoria: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')`
        ),
      },
    },
    group: ["Transactions.id_categoria", "categoria.id_categoria"],
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getReceitaCategoria = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      "id_categoria",
      [
        Sequelize.literal(`
      COALESCE(SUM(
        CASE WHEN 
        "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') AND
        date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') AND
        "Transactions".valor > 0 
        AND "Transactions".descricao <> 'Pagamento de fatura' 
        AND "Transactions".objetivo = false
        AND "Transactions".id_users = '${req.id}' 
        THEN valor ELSE 0 END
      ),0)
      `),
        "valor",
      ],
    ],
    include: [
      {
        model: Categorias,
        attributes: ["nome"],
        as: "categoria",
      },
    ],
    where: {
      id_users: req.id,
      descricao: {
        [Sequelize.Op.ne]: "Pagamento de fatura",
      },
      id_categoria: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')`
        ),
      },
    },
    group: ["Transactions.id_categoria", "categoria.id_categoria"],
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getPendencias = (req, res) => {
  Transactions.findAll({
    attributes: [
      [
        Sequelize.literal(
          `COALESCE(SUM(CASE WHEN valor >= 0 AND "Transactions".id_users = '${req.id}'  THEN valor ELSE 0 END),0)`
        ),
        "receita",
      ],
      [
        Sequelize.literal(
          `COALESCE(SUM(CASE WHEN valor < 0 AND "Transactions".id_users = '${req.id}'  THEN valor ELSE 0 END),0)`
        ),
        "despesa",
      ],
    ],
    where: {
      status: {
        [Sequelize.Op.eq]: false,
      },
      id_users: req.id,
      id_categoria: {
        [Sequelize.Op.notIn]: Sequelize.literal(
          `(SELECT id_categoria FROM "Categorias" WHERE tipo = 'Não Contabilizar')`
        ),
      },
    },
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getDesempenho = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Transactions.findAll({
    attributes: [
      [
        Sequelize.literal(`SUM(CASE WHEN valor >= 0 AND
        date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
          AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos")
      AND "Transactions".id_users = '${req.id}' 
      AND "Transactions".objetivo = false
      AND "Transactions".id_categoria IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Receitas')
      THEN valor ELSE 0 END)`),
        "receita",
      ],
      [
        Sequelize.literal(`ABS(SUM(CASE WHEN valor < 0 AND date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
      AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
      AND "Transactions".id_users = '${req.id}' 
      AND "Transactions".objetivo = false
      AND "Transactions".descricao <> 'Pagamento de fatura' 
      AND "Transactions".id_categoria IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Gastos Essenciais')
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END))`),
        "gastos_essenciais",
      ],
      [
        Sequelize.literal(`ABS(SUM(CASE WHEN valor < 0 AND date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
      AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}') 
      AND "Transactions".id_users = '${req.id}' 
      AND "Transactions".objetivo = false
      AND "Transactions".descricao <> 'Pagamento de fatura' 
      AND "Transactions".id_categoria IN (SELECT id_categoria FROM "Categorias" WHERE tipo = 'Gastos')
      AND "Transactions".id_conta not in (SELECT id_conta FROM "Objetivos") THEN valor ELSE 0 END))`),
        "gastos",
      ],
    ],
    raw: true,
  })
    .then((data) => {
      const dataResult = data.map((el) => changeNullToZero(el))[0];

      const investimento =
        dataResult.receita < dataResult.gastos_essenciais + dataResult.gastos
          ? 0
          : dataResult.receita -
            (dataResult.gastos_essenciais + dataResult.gastos);

      res.json({
        gastosEssenciais: percentage_from(
          dataResult.gastos_essenciais,
          dataResult.receita
        ),
        gastos: percentage_from(dataResult.gastos, dataResult.receita),
        investimento:
          investimento == 0
            ? 0
            : percentage_from(investimento, dataResult.receita),
      });
    })
    .catch((err) => res.status(204).json(err));
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
  getDesempenho,
};
