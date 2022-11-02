const { Op } = require("sequelize");
const sequelize = require("sequelize");
const { validate: uuidValidate, v4: uuidv4 } = require("uuid");
const { ofxToDate } = require("../../utils/date-format");
const Transactions = require("../TransactionModel");

class NubankOfx {
  async handle(transaction, id_conta, id_users, semCategoria) {
    this.transaction = transaction;
    this.id_conta = id_conta;
    this.id_users = id_users;
    this.semCategoria = semCategoria;
    const categoria = await this.getCategoria();

    return {
      ...this.getId(),
      ...this.getDescricao(),
      ...this.getValor(),
      ...this.getDate(),
      ...this.getIdUsers(),
      ...this.getIdConta(),
      ...categoria,
    };
  }

  async getCategoria() {
    const descricao = this.getDescricao()?.descricao;
    let id_categoria = this.semCategoria;

    const foundTransaction = await Transactions.findOne({
      where: {
        descricao: {
          [Op.iLike]: descricao,
        },
        id_categoria: {
          [sequelize.Op.ne]: this.semCategoria,
        },
      },
      raw: true,
    });

    if (foundTransaction?.id_categoria)
      id_categoria = foundTransaction?.id_categoria;

    return {
      id_categoria,
    };
  }

  getIdUsers() {
    if (this.id_users)
      return {
        id_users: this.id_users,
      };
  }

  getIdConta() {
    if (this.id_conta)
      return {
        id_conta: this.id_conta,
      };
  }

  getId() {
    let id = this.transaction.FITID.replace(":reversal", "");

    if (!uuidValidate(id)) id = uuidv4();

    return {
      id,
    };
  }

  getDescricao() {
    return {
      descricao: this.transaction.MEMO,
    };
  }

  getValor() {
    let valor = Number.parseFloat(this.transaction.TRNAMT);

    return {
      valor: Number.isNaN ? valor : 0,
    };
  }

  getDate() {
    return {
      date: ofxToDate(this.transaction.DTPOSTED),
    };
  }
}

module.exports = NubankOfx;
