const Cartoes = require("../models/CartoesModel");
const Instituicoes = require("../models/InstituicoesModel");
const Contas = require("../models/ContasModel");
const sequelize = require("sequelize");

const getAll = async (req, res) => {
  const { date } = req.query;
  if (!date)
    return res.status(400).json({ message: "Campo date é necessário." });

  await Contas.findAll({
    attributes: [
      "id_conta",
      "id_instituicao",
      "id_cartao",
      [
        sequelize.literal(`(
      SELECT ABS(COALESCE(SUM(
          CASE WHEN date_part('month', "Transactions".date) = date_part('month', timestamp '${date}') 
          AND date_part('year', "Transactions".date) = date_part('year', timestamp '${date}')
          AND "Transactions".id_users = '${req.id}'  
          AND "Transactions".id_conta = "Contas".id_conta THEN valor ELSE 0 END
      ),0)) as saldo_contas FROM "Transactions"
      )`),
        "saldo_atual",
      ],
    ],
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
      id_cartao: {
        [sequelize.Op.ne]: null,
      },
      id_users: req.id,
    },
  })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const getOne = async (req, res) => {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ message: "O id deve ser passado na url." });

  await Cartoes.findByPk(id, { where: { id_users: req.id } })
    .then((data) => res.json(data))
    .catch((err) => res.status(204).json(err));
};

const setOne = async (req, res) => {
  const { vencimento, fechamento, limite, id_instituicao } = req.body;
  if (!vencimento || !fechamento || !limite || !id_instituicao)
    return res.status(400).json({
      message:
        "Campos necessários: vencimento, fechamento, limite, id_instituicao",
    });

  await Cartoes.create({
    vencimento,
    fechamento,
    limite,
    id_instituicao,
    id_users: req.id,
  })
    .then(async (data) => {
      await Contas.create({
        id_cartao: data.dataValues.id_cartao,
        id_instituicao,
        id_users: req.id,
      });

      res.json(data);
    })
    .catch((error) => res.status(204).json(error));
};

const putOne = async (req, res) => {
  const { vencimento, fechamento, limite, id_instituicao } = req.body;
  if (!vencimento || !fechamento || !limite || !id_instituicao)
    return res.status(400).json({
      message:
        "Campos necessários: vencimento, fechamento, limite, id_instituicao",
    });

  const { id } = req.params;
  if (!id)
    return res.status(400).json({
      message: "O id deve ser passado na url.",
    });

  await Cartoes.update(
    {
      vencimento,
      fechamento,
      limite,
      id_instituicao,
    },
    {
      where: {
        id_cartao: req.params.id,
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
    return res.status(400).json({
      message: "O id deve ser passado na url.",
    });

  await Cartoes.destroy({
    where: {
      id_cartao: id,
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
