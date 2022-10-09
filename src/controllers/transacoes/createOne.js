const { CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } =
  require("http-status-codes").StatusCodes;

const Sequelize = require("sequelize");
const Transactions = require("../../models/TransactionModel");
const Categorias = require("../../models/CategoriasModel");
const Contas = require("../../models/ContasModel");

module.exports = async (req, res, next) => {
  let status = req.bodyString("status").toLowerCase();
  let id_conta = req.bodyString("id_conta").toLowerCase();
  let valor = req.bodyFloat("valor");
  let date = req.bodyString("date").toLowerCase();
  let id_conta2 = req.bodyString("id_conta2").toLowerCase();

  if (!status || !id_conta || !valor || id_conta2)
    return res.status(BAD_REQUEST).json({
      message: "Campos necessários: status, id_conta, valor e id_conta2",
    });

  const timeNow = new Date().toLocaleTimeString("pt-BR");
  date = new Date(`${date}T${timeNow}Z`).toISOString();

  try {
    let categorias = await Categorias.findAll({
      attributes: ["id_categoria", "nome"],
      where: {
        nome: {
          [Sequelize.Op.or]: [
            "transferência enviada",
            "transferência recebida",
          ],
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
      let transfEnviada = await Transactions.create({
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

      let transfRecebida = await Transactions.create({
        id_banco_transferencia: transfEnviada.id,
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
      });

      transfEnviada.id_banco_transferencia = transfRecebida.id;
      await transfEnviada
        .save()
        .then((data) => res.status(CREATED).json(data))
        .catch((err) => res.status(INTERNAL_SERVER_ERROR).json(err));
    }
  } catch (error) {
    return next(error);
  }
};
