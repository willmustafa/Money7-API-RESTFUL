const { validate: uuidValidate, v4: uuidv4 } = require("uuid");
const { ofxToDate } = require("../../utils/date-format");

class NubankOfx {
  handle(transaction) {
    this.transaction = transaction;

    return {
      ...this.getId(),
      ...this.getDescricao(),
      ...this.getValor(),
      ...this.getDate(),
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
