const Transaction = require("../models/TransactionModel");
const Categoria = require("../models/CategoriasModel");
const Contas = require("../models/ContasModel");
const Instituicoes = require("../models/InstituicoesModel");
const {
  NubankCardTransaction,
  NubankAccountTransaction,
} = require("../models/Parser/nubank");
const fs = require("fs");
const path = require("path");
const sequelize = require("sequelize");

const { NubankApi } = require("nubank-api");

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

const generateCertificate = async (req, res) => {
  console.log(path.join(__dirname, `../auth/${req.id}.secret`));
  const { cpf, password } = req.body;

  if (!cpf || !password) {
    res.status(400).json({ error: "Necessário passar o cpf e password." });
    return;
  }

  const DEVICE_ID = "money7-app";
  const api = new NubankApi({
    clientName: "money7/app",
  });

  await api.auth.requestAuthenticationCode({
    cpf,
    password,
    deviceId: DEVICE_ID,
  });

  await fs.promises.writeFile(
    path.join(__dirname, `../auth/${req.id}.secret`),
    api.auth._encryptedCode
  );

  res.status(200).json({ message: "foi enviado o token para o email." });
};

const generateCertificate_second = async (req, res) => {
  const { cpf, password, authCode } = req.body;
  if (!cpf || !password || !authCode) {
    res
      .status(400)
      .json({ error: "Necessário passar o cpf, password e authCode." });
    return;
  }

  const DEVICE_ID = "money7-app";
  const api = new NubankApi({
    clientName: "money7/app",
  });

  api.auth._encryptedCode = await fs.promises.readFile(
    path.join(__dirname, `../auth/${req.id}.secret`)
  );
  const certificates = await api.auth.exchangeCertificates({
    cpf,
    password,
    deviceId: DEVICE_ID,
    authCode,
  });

  await fs.promises.writeFile(
    path.join(__dirname, `../auth/${req.id}.cert.p12`),
    certificates.cert,
    { encoding: "binary" }
  );

  const authCert = await fs.promises.readFile(
    path.join(__dirname, `../auth/${req.id}.cert.p12`)
  );

  await api.auth.authenticateWithCertificate(cpf, password, authCert);

  await fs.promises.writeFile(
    path.join(__dirname, `../auth/${req.id}.auth-state-cert.json`),
    JSON.stringify(api.authState)
  );

  // await fs.promises.rm(path.join(__dirname, `../auth/${req.id}.secret`));

  res.status(200);
};

const getNubankFeed = async (req, res) => {
  let authState = null;
  let cert = null;
  await fs
    .readFileSync(
      path.join(__dirname, `../auth/${req.id}.auth-state-cert.json`),
      "utf8"
    )
    .then((data) => (authState = JSON.parse(data.toString("utf8"))));

  await fs.promises
    .readFile(path.join(__dirname, `../auth/${req.id}.cert.p12`))
    .then((data) => (cert = data));

  const api = new NubankApi({
    ...authState,
    clientName: "money7/app",
    cert,
  });

  const accountFeed = await api.account.getFeed();
  const creditCardFeed = await api.card.getFeed();
  const investmentFeed = await api.account.getInvestments();
  console.log(accountFeed);

  // let results = {};
  // results.importAccountFeed = await importAccountFeed(req, res);
  // results.importCreditCardFeed = await importCreditCardFeed(req, res);

  res.status(200).json(accountFeed);
};

const importAccountFeed = async (req, res) => {
  let accountFeed = await fs.promises
    .readFile(
      path.join(__dirname, `../auth/${req.id}.account-feed.json`),
      "utf8"
    )
    .then((data) => JSON.parse(data));

  for await (const transaction of accountFeed.filter(
    (el) =>
      !new NubankAccountTransaction().ignoreTypes().includes(el.__typename)
  )) {
    const parsedAccount = new NubankAccountTransaction().handle(transaction);
    parsedAccount.id_users = req.id;

    await Categoria.findOne({
      attributes: ["id_categoria"],
      where: {
        nome: parsedAccount.categoria,
      },
    }).then(async (data) => {
      if (data) parsedAccount.id_categoria = data.id_categoria;

      if (!data)
        await Categoria.create({
          nome: parsedAccount.categoria,
          id_users: req.id,
        }).then((dataId) => (parsedAccount.id_categoria = dataId.id_categoria));
    });

    await Contas.findOne({
      attributes: ["id_conta"],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome"],
          as: "instituicao",
        },
      ],
      where: {
        [sequelize.Op.and]: [
          sequelize.literal(`"instituicao"."nome" = 'NuBank'`),
          sequelize.literal(`id_users = '${req.id}'`),
        ],
      },
    }).then(async (data) => {
      if (data) parsedAccount.id_conta = data.id_conta;

      if (!data)
        res
          .status(400)
          .json({ error: "Você precisa criar uma conta do nubank primeiro" });
    });

    try {
      await Transaction.create(parsedAccount);
    } catch (error) {
      console.log(parsedAccount.id);
    }
  }

  return accountFeed.length;
};

const importCreditCardFeed = async (req, res) => {
  let accountFeed = await fs.promises
    .readFile(path.join(__dirname, `../auth/${req.id}.feedCard.json`), "utf8")
    .then((data) => JSON.parse(data));

  for await (const transaction of accountFeed.filter(
    (el) => !new NubankCardTransaction().ignoreTypes().includes(el.category)
  )) {
    const parsedAccount = new NubankCardTransaction().handle(transaction);
    parsedAccount.id_users = req.id;

    await Categoria.findOne({
      attributes: ["id_categoria"],
      where: {
        nome: parsedAccount.categoria,
      },
    }).then(async (data) => {
      if (data) parsedAccount.id_categoria = data.id_categoria;

      if (!data)
        await Categoria.create({
          nome: parsedAccount.categoria,
          id_users: req.id,
        }).then((dataId) => (parsedAccount.id_categoria = dataId.id_categoria));
    });

    await Contas.findOne({
      attributes: ["id_conta"],
      include: [
        {
          model: Instituicoes,
          attributes: ["nome"],
          as: "instituicao",
        },
      ],
      where: {
        [sequelize.Op.and]: [
          sequelize.literal(`"instituicao"."nome" = 'NuBank'`),
          sequelize.literal(`id_users = '${req.id}'`),
          sequelize.literal(`id_cartao IS NOT NULL`),
        ],
      },
    }).then(async (data) => {
      if (data) parsedAccount.id_conta = data.id_conta;

      if (!data)
        res
          .status(400)
          .json({ error: "Você precisa criar uma conta do nubank primeiro" });
    });

    try {
      await Transaction.create(parsedAccount);
    } catch (error) {
      console.log(parsedAccount.id);
    }
  }

  return accountFeed.length;
};

module.exports = {
  saveAccountFeed,
  saveCartaoFeed,
  generateCertificate,
  generateCertificate_second,
  getNubankFeed,
};
