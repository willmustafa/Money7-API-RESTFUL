const Objetivos = require("../models/ObjetivosModel");
const Categorias = require("../models/CategoriasModel");
const Contas = require("../models/ContasModel");
const sequelize = require("sequelize");
const Instituicoes = require("../models/InstituicoesModel");
const { Sequelize } = require("sequelize");

const getAll = async (req, res) => {
  const limit = req.query.limit ? req.query.limit : 100;

  await Objetivos.findAll({
    attributes: [
      "id_objetivo",
      "titulo",
      "cor",
      "valor_total",
      "date",
      "id_categoria",
      "description",
      "id_conta",
      [
        sequelize.literal(`(
      SELECT COALESCE(SUM(
          CASE WHEN "Transactions".id_conta = "Objetivos".id_conta 
          AND "Transactions".id_users = '${req.id}'
          THEN valor ELSE 0 END
      ),0) as saldo_contas FROM "Transactions"
    )`),
        "saldo_atual",
      ],
      [
        sequelize.literal(`(
      SELECT COALESCE(SUM(
          CASE WHEN "Transactions".id_conta = "Objetivos".id_conta 
          AND "Transactions".id_users = '${req.id}'
          THEN valor ELSE 0 END
      ),0) as saldo_contas FROM "Transactions"
    ) - valor_total`),
        "diferenca",
      ],
    ],
    include: [
      {
        model: Categorias,
        attributes: ["nome", "cor", "icone"],
        as: "categoria",
      },
    ],
    where: {
      id_users: req.id,
    },
    order: [[Sequelize.literal('"diferenca" ASC')], ["date", "ASC"]],
    limit,
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Objetivos.findByPk(id, {
    attributes: [
      "id_objetivo",
      "titulo",
      "cor",
      "valor_total",
      "date",
      "id_categoria",
      "description",
    ],
    include: [
      {
        model: Categorias,
        attributes: ["nome", "cor", "icone"],
        as: "categoria",
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
  console.log(req.body);
  const { titulo, cor, valor, date, description, id_categoria } = req.body;

  let id_instituicao = "";
  await Instituicoes.findOne({
    attributes: ["id_instituicao"],
    where: {
      nome: "Objetivo",
    },
  }).then(async (data) => {
    if (data) id_instituicao = data.dataValues.id_instituicao;
    if (!data)
      await Instituicoes.create({
        nome: "Objetivo",
        cor: "bg-info",
        icone: "icon-none",
      }).then((dataI) => {
        if (dataI) id_instituicao = dataI.dataValues.id_instituicao;
      });
  });

  await Contas.create({
    saldo: 0,
    id_instituicao,
    contaObjetivo: true,
    id_users: req.id,
  })
    .then(async (data) => {
      await Objetivos.create({
        titulo,
        cor,
        valor_total: valor,
        date,
        description,
        id_categoria,
        id_conta: data.dataValues.id_conta,
        id_users: req.id,
      })
        .then((data) => res.json(data))
        .catch((err) => res.status(204).json(err));
    })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const putOne = async (req, res) => {
  const { titulo, cor, valor, date, description, id_categoria } = req.body;
  if (!titulo || !cor || !valor || !date || !id_categoria)
    return res.status(400).json({
      message:
        "Campos necessários: titulo, cor, valor, date, description, id_categoria",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Objetivos.update(
    {
      titulo,
      cor,
      valor_total: valor,
      description,
      date,
      id_categoria,
    },
    {
      where: {
        id_objetivo: id,
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

  await Objetivos.destroy({
    where: {
      id_objetivo: id,
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

module.exports = {
  getAll,
  getOne,
  setOne,
  putOne,
  deleteOne,
};
