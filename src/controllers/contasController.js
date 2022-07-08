const Sequelize = require("sequelize");
const Contas = require("../models/ContasModel");
const Instituicoes = require("../models/InstituicoesModel");
const Cartoes = require("../models/CartoesModel");
const { lastDateOfMonth } = require("../utils/date-format");

const getAll = async (req, res) => {
  await Contas.findAll({
    attributes: ["id_conta", "saldo", "date", "id_instituicao"],
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
    },
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const { id } = req.params;
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
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const setOne = async (req, res) => {
  const { saldo, date, id_instituicao, id_users } = req.body;
  if (!saldo || !date || !id_instituicao || !id_users)
    return res.status(400).json({
      message: "Campos necessários: saldo, date, id_instituicao, id_users",
    });

  await Contas.create({
    saldo: saldo,
    date: date,
    id_instituicao: id_instituicao,
    id_users: id_users,
  })
    .then((data) => res.json(data))
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { saldo, date, id_instituicao, id_users } = req.body;
  if (!saldo || !date || !id_instituicao || !id_users)
    return res.status(400).json({
      message: "Campos necessários: saldo, date, id_instituicao, id_users",
    });

  const { id } = req.params;
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

  await Contas.destroy({
    where: {
      id_conta: id,
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
            CASE WHEN "Contas"."date" <= '${date}' THEN saldo ELSE 0 END
            )
            +
            (
              SELECT COALESCE(SUM(
                  CASE WHEN "Transactions".date <= '${lastDateOfMonth(date)}'
                  AND "Transactions".id_conta = "Contas".id_conta THEN valor ELSE 0 END
              ),0) as saldo_contas FROM "Transactions"
          )
            `),
        "saldo_atual",
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
    },
    order: [[Sequelize.literal("saldo_atual DESC")]],
    group: ["id_conta", "instituicao.id_instituicao"],
    limit: limit ? limit : 4,
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getContasCartoes = async (req, res) => {
  await Contas.findAll({
    attributes: ["id_conta", "saldo", "date", "id_instituicao", "id_cartao"],
    include: [
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
    ],
    where: {
      contaObjetivo: {
        [Sequelize.Op.ne]: true,
      },
    },
    group: [
      "Contas.id_cartao",
      "Contas.id_conta",
      "instituicao.id_instituicao",
      "cartao.id_cartao",
    ],
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
