const { CREATED, INTERNAL_SERVER_ERROR, BAD_REQUEST } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const database = require("../../database/index");

module.exports = async (req, res, next) => {
  const date = req.queryString("date");
  if (!date)
    return res.status(BAD_REQUEST).json({ message: "Date is required." });

  try {
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
      .then((data) => res.status(CREATED).json(data))
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
  } catch (error) {
    return next(error);
  }
};
