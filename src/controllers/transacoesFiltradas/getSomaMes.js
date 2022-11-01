const { BAD_REQUEST } = require("http-status-codes").StatusCodes;

const TransactionModel = require("../../models/TransactionModel");
const ContasModel = require("../../models/ContasModel");
const CategoriasModel = require("../../models/CategoriasModel");
const ObjetivosModel = require("../../models/ObjetivosModel");
const sequelize = require("sequelize");

let Objetivos, Contas, ObjetivosEContas, NaoContabilizar, userID, date;

module.exports = async (req, res, next) => {
  date = req.queryString("date");
  if (!date)
    return res.status(BAD_REQUEST).json({ message: "Date is required." });

  userID = req.id;

  try {
    await getObjetivos();
    await getContas();
    await getNaoContabilizar();
    ObjetivosEContas = [...Objetivos, ...Contas];

    const receita = (await getReceitas()) ?? 0;
    const despesa = (await getDespesas()) ?? 0;
    const saldo_total = await getSaldoTotal();

    res.json({
      saldo_total,
      receita,
      despesa,
      despesa_perc_last: 0,
      receita_perc_last: 0,
      balanco_perc_last: 0,
      saldo_atual: 0,
    });
  } catch (error) {
    return next(error);
  }
};

const getNaoContabilizar = async () => {
  NaoContabilizar = await CategoriasModel.findAll({
    attributes: ["id_categoria"],
    where: {
      tipo: "Não Contabilizar",
      id_users: userID,
    },
  }).then((resArr) =>
    resArr.map((categoriasRes) => categoriasRes.id_categoria)
  );
};

const getContas = async () => {
  Contas = await ContasModel.findAll({
    attributes: ["id_conta"],
    where: {
      id_users: userID,
      id_cartao: {
        [sequelize.Op.ne]: null,
      },
    },
  }).then((resArr) => resArr.map((contaRes) => contaRes.id_conta));
};

const getObjetivos = async () => {
  Objetivos = await ObjetivosModel.findAll({
    attributes: ["id_conta"],
    where: {
      id_users: userID,
    },
  }).then((resArr) => resArr.map((objective) => objective.id_conta));
};

const getSaldoTotal = async () => {
  const saldo_transacoes =
    (await TransactionModel.findAll({
      attributes: [
        [
          sequelize.fn("sum", sequelize.col("Transactions.valor")),
          "saldo_total",
        ],
      ],
      where: {
        id_users: userID,
        objetivo: false,
        descricao: {
          [sequelize.Op.ne]: "Transferência",
        },
        id_conta: {
          [sequelize.Op.notIn]: ObjetivosEContas,
        },
      },
      raw: true,
    }).then((data) => data[0].saldo_total)) ?? 0;

  const saldo_contas =
    (await ContasModel.findAll({
      attributes: [
        [sequelize.fn("sum", sequelize.col("saldo")), "saldo_contas"],
      ],
      where: {
        id_users: userID,
        contaObjetivo: false,
        id_cartao: {
          [sequelize.Op.eq]: null,
        },
      },
      raw: true,
    }).then((data) => data[0].saldo_contas)) ?? 0;

  return saldo_transacoes + saldo_contas;
};

const getReceitas = async () => {
  const receitas = await TransactionModel.findAll({
    attributes: [
      [sequelize.fn("sum", sequelize.col("Transactions.valor")), "receitas"],
    ],
    where: {
      id_users: userID,
      valor: {
        [sequelize.Op.gte]: 0,
      },
      objetivo: false,
      [sequelize.Op.and]: [
        sequelize.where(
          sequelize.fn(
            "date_part",
            "month",
            sequelize.col("Transactions.date")
          ),
          sequelize.Op.eq,
          sequelize.fn("date_part", "month", sequelize.cast(date, "timestamp"))
        ),
        sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("Transactions.date")),
          sequelize.Op.eq,
          sequelize.fn("date_part", "year", sequelize.cast(date, "timestamp"))
        ),
      ],
      id_conta: {
        [sequelize.Op.notIn]: ObjetivosEContas,
      },
      descricao: {
        [sequelize.Op.ne]: "Transferência",
      },
      id_categoria: {
        [sequelize.Op.notIn]: NaoContabilizar,
      },
    },
    raw: true,
  }).then((data) => data[0].receitas);

  return receitas;
};

const getDespesas = async () => {
  const receitas = await TransactionModel.findAll({
    attributes: [
      [sequelize.fn("sum", sequelize.col("Transactions.valor")), "desepesas"],
    ],
    where: {
      id_users: userID,
      valor: {
        [sequelize.Op.lte]: 0,
      },
      objetivo: false,
      [sequelize.Op.and]: [
        sequelize.where(
          sequelize.fn(
            "date_part",
            "month",
            sequelize.col("Transactions.date")
          ),
          sequelize.Op.eq,
          sequelize.fn("date_part", "month", sequelize.cast(date, "timestamp"))
        ),
        sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("Transactions.date")),
          sequelize.Op.eq,
          sequelize.fn("date_part", "year", sequelize.cast(date, "timestamp"))
        ),
      ],
      id_conta: {
        [sequelize.Op.notIn]: ObjetivosEContas,
      },
      descricao: {
        [sequelize.Op.ne]: "Transferência",
      },
      id_categoria: {
        [sequelize.Op.notIn]: NaoContabilizar,
      },
    },
    raw: true,
  }).then((data) => data[0].desepesas);

  return receitas;
};
