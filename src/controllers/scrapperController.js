const Transaction = require("../models/TransactionModel");
const Categoria = require("../models/CategoriasModel");
const Contas = require("../models/ContasModel");
const {
  NubankCardTransaction,
  NubankAccountTransaction,
} = require("../models/Parser/nubank");
const fs = require("fs");
const path = require("path");
const sequelize = require("sequelize");

const saveAccountFeed = async (req, res) => {
  const id_conta = await Contas.findOne({
    attributes: ["id_conta"],
    where: {
      id_instituicao: [
        sequelize.literal(
          '(SELECT id_instituicao FROM "Instituicoes" WHERE "Instituicoes"."nome" = \'NuBank\')'
        ),
      ],
      id_cartao: null,
    },
  }).then((res) => res.dataValues.id_conta);

  const accountFeed = JSON.parse(
    fs
      .readFileSync(
        path.join(__dirname, "../scrappers/nubank/auth/account-feed.json")
      )
      .toString("utf8")
  );

  for (const transaction of accountFeed.filter(
    (el) =>
      !new NubankAccountTransaction().ignoreTypes().includes(el.__typename)
  )) {
    const parser = new NubankAccountTransaction();

    let parsedTransaction = parser.handle(transaction);
    try {
      await Categoria.findOne({
        attributes: ["id_categoria"],
        where: { nome: parsedTransaction.categoria },
      }).then(async (res) => {
        if (res == null) {
          await Categoria.create({
            nome: parsedTransaction.categoria,
            tipo: "gastos",
            id_users: 1,
          }).then(
            (res) => (parsedTransaction.id_categoria = res.data.id_categoria)
          );
        } else {
          parsedTransaction.id_categoria = res.dataValues.id_categoria;
        }

        await Transaction.create({
          ...parsedTransaction,
          id_conta,
          id_users: 1,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  res.json({ transactions_count: accountFeed.length });
};

const saveCartaoFeed = async (req, res) => {
  const id_conta = await Contas.findOne({
    attributes: [
      [
        sequelize.literal(`(SELECT id_conta FROM "Contas" WHERE 
      "Contas"."id_cartao" = (SELECT id_cartao FROM "Cartoes" 
      WHERE "Cartoes"."id_instituicao" = (SELECT id_instituicao FROM "Instituicoes" 
      WHERE "Instituicoes"."nome" = 'NuBank')))`),
        "id_conta",
      ],
    ],
  }).then((res) => res.dataValues.id_conta);

  const accountFeed = JSON.parse(
    fs
      .readFileSync(
        path.join(__dirname, "../scrappers/nubank/auth/feedCard.json")
      )
      .toString("utf8")
  );

  for (const transaction of accountFeed.filter(
    (el) => el.category == "transaction" || el.category == "top_up"
  )) {
    const parser = new NubankCardTransaction();

    let parsedTransaction = parser.handle(transaction);

    try {
      await Categoria.findOne({
        attributes: ["id_categoria"],
        where: { nome: parsedTransaction.categoria },
      }).then(async (res) => {
        if (res == null) {
          await Categoria.create({
            nome: parsedTransaction.categoria,
            tipo: "gastos",
            id_users: 1,
          }).then(
            (res) => (parsedTransaction.id_categoria = res.data.id_categoria)
          );
        } else {
          parsedTransaction.id_categoria = res.dataValues.id_categoria;
        }

        await Transaction.create({
          ...parsedTransaction,
          id_conta,
          id_users: 1,
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  res.json({
    transactions_count: accountFeed.filter(
      (el) => el.category == "transaction" || el.category == "top_up"
    ).length,
  });
};

module.exports = {
  saveAccountFeed,
  saveCartaoFeed,
};
