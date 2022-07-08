const Objetivos = require("../models/ObjetivosModel");
const Categorias = require("../models/CategoriasModel");
const Contas = require("../models/ContasModel");
const sequelize = require("sequelize");

const getAll = async (req, res) => {
  const date = req.query.date
    ? `"Transactions".date <= '${req.query.date}' AND`
    : "";

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
          CASE WHEN ${date} "Transactions".id_conta = "Objetivos".id_conta THEN valor ELSE 0 END
      ),0) as saldo_contas FROM "Transactions"
    )`),
        "saldo_atual",
      ],
    ],
    include: [
      {
        model: Categorias,
        attributes: ["nome", "cor", "icone"],
        as: "categoria",
      },
    ],
    order: [["date", "ASC"]],
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
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const setOne = async (req, res) => {
  const { titulo, cor, valor, id_users, date, description, id_categoria } =
    req.body;
  if (
    !titulo ||
    !cor ||
    !valor ||
    !id_users ||
    !date ||
    !description ||
    !id_categoria
  )
    return res.status(400).json({
      message:
        "Campos necessários: titulo, cor, valor, id_users, date, description, id_categoria",
    });

  await Contas.create({
    saldo: 0,
    id_instituicao: 9999,
    contaObjetivo: true,
    id_users,
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
        id_users,
      })
        .then((data) => res.json(data))
        .catch((err) => res.status(204).json(err));
    })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const putOne = async (req, res) => {
  const { titulo, cor, valor, id_users, date, description, id_categoria } =
    req.body;
  if (
    !titulo ||
    !cor ||
    !valor ||
    !id_users ||
    !date ||
    !description ||
    !id_categoria
  )
    return res.status(400).json({
      message:
        "Campos necessários: titulo, cor, valor, id_users, date, description, id_categoria",
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
        id_users,
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
