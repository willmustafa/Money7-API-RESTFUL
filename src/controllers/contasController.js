const Sequelize = require("sequelize");
const Contas = require("../models/ContasModel");
const Instituicoes = require("../models/InstituicoesModel");
const Cartoes = require("../models/CartoesModel");
const { lastDateOfMonth } = require("../utils/date-format");
const Objetivos = require("../models/ObjetivosModel");

const getAll = async (req, res) => {
  const { contaObjetivo } = req.query;

  let contaObjetivoObj = { contaObjetivo: { [Sequelize.Op.ne]: true } };
  if (contaObjetivo !== undefined) contaObjetivoObj = {};

  await Contas.findAll({
    attributes: [
      "id_conta",
      "saldo",
      "date",
      "id_instituicao",
      "contaObjetivo",
    ],
    include: [
      {
        model: Instituicoes,
        attributes: ["nome", "cor", "icone"],
        as: "instituicao",
      },
    ],
    where: {
      ...contaObjetivoObj,
      id_cartao: {
        [Sequelize.Op.eq]: null,
      },
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const id = req.paramString("id");
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Contas.findByPk(id, {
    attributes: ["id_conta", "saldo", "date", "id_instituicao"],
    include: [
      {
        model: Instituicoes,
        attributes: ["nome", "cor", "icone"],
        as: "instituicao",
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
  const { saldo, date, id_instituicao } = req.body;
  if (saldo === undefined || date === undefined || id_instituicao === undefined)
    return res.status(400).json({
      message: "Campos necessários: saldo, date, id_instituicao",
    });

  await Contas.create({
    saldo: saldo,
    date: date,
    id_instituicao: id_instituicao,
    id_users: req.id,
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { saldo, date, id_instituicao } = req.body;
  if (!saldo || !date || !id_instituicao)
    return res.status(400).json({
      message: "Campos necessários: saldo, date, id_instituicao",
    });

  const id = req.paramString("id");
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Contas.update(
    {
      saldo,
      date,
      id_instituicao,
    },
    {
      where: {
        id_conta: id,
        id_users: req.id,
      },
    }
  )
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const deleteOne = async (req, res) => {
  const id = req.paramString("id");
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Contas.destroy({
    where: {
      id_conta: id,
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const getSaldoAtualPrevisto = async (req, res) => {
  const { date, limit } = req.query;
  if (!date || !limit)
    return res
      .status(400)
      .json({ message: "Campo date e limit é necessário." });

  await Contas.findAll({
    attributes: [
      "id_conta",
      "date",
      "saldo",
      "id_instituicao",
      [
        Sequelize.literal(`SUM(
            CASE WHEN "Contas"."date" <= '${date}' 
            AND "Contas".id_users = '${req.id}'
            THEN saldo ELSE 0 END
            )
            +
            (
              SELECT COALESCE(SUM(
                  CASE WHEN "Transactions".date <= '${lastDateOfMonth(date)}'
                  AND "Transactions".id_conta = "Contas".id_conta 
                  AND "Transactions".id_users = '${req.id}'
                  THEN valor ELSE 0 END
              ),0) as saldo_contas FROM "Transactions"
          )
            `),
        "saldo_atual",
      ],
      [
        Sequelize.literal(`
            (SELECT ABS(COALESCE(SUM(
              CASE WHEN "Transactions".date <= '${lastDateOfMonth(date)}'
              AND "Transactions".id_conta = "Contas".id_conta 
              AND "Transactions".id_users = '${req.id}'
              AND "Transactions".objetivo = true
              THEN valor ELSE 0 END
            ),0)) FROM "Transactions")
            `),
        "saldo_objetivo",
      ],
    ],
    include: [
      {
        model: Instituicoes,
        attributes: ["nome", "cor", "icone"],
        as: "instituicao",
      },
    ],
    where: {
      contaObjetivo: {
        [Sequelize.Op.ne]: true,
      },
      id_cartao: {
        [Sequelize.Op.eq]: null,
      },
      id_users: req.id,
    },
    order: [[Sequelize.literal("saldo_atual DESC")]],
    group: ["id_conta", "instituicao.id_instituicao"],
    limit: limit ? limit : 4,
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getContasCartoes = async (req, res) => {
  const { contaObjetivo } = req.query;

  let contaObjetivoObj = { contaObjetivo: { [Sequelize.Op.ne]: true } };
  if (contaObjetivo !== undefined) contaObjetivoObj = {};

  let group = [
    "Contas.id_cartao",
    "Contas.id_conta",
    "instituicao.id_instituicao",
    "cartao.id_cartao",
  ];
  if (contaObjetivo !== undefined) group.push("Objetivos.id_objetivo");

  let include = [
    {
      model: Instituicoes,
      attributes: ["nome", "cor", "icone"],
      as: "instituicao",
    },
    {
      model: Cartoes,
      attributes: ["limite", "vencimento", "fechamento"],
      as: "cartao",
    },
  ];
  if (contaObjetivo !== undefined) include.push({ model: Objetivos });

  await Contas.findAll({
    attributes: [
      "id_conta",
      "saldo",
      "date",
      "id_instituicao",
      "id_cartao",
      "contaObjetivo",
    ],
    include,
    where: {
      ...contaObjetivoObj,
      id_users: req.id,
    },
    group,
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
  getSaldoAtualPrevisto,
  getContasCartoes,
};
