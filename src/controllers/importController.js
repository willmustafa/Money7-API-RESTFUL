const ofx = require("ofx-convertjs");
const path = require("path");
const Categorias = require("../models/CategoriasModel");
const bankOfx = require("../models/Parser/bankOfx");
const Transactions = require("../models/TransactionModel");
const bankOfx_parser = new bankOfx();

const importFromFile = async (req, res) => {
  const { id_conta, excluir } = req.body;
  if (!id_conta) return res.status(400).end();

  const semCategoria = await Categorias.findOne({
    attributes: ["id_categoria"],
    where: {
      nome: "sem categoria",
    },
    raw: true,
  });

  for (const file of req.files) {
    const fileFromBuffer = file.buffer.toString("utf-8").replaceAll("&", " ");

    try {
      if (path.extname(file.originalname) == ".ofx") {
        const importedFile = ofx.toJson(fileFromBuffer);

        if (importedFile.OFX.BANKMSGSRSV1.BANKTRANLIST.STMTTRN) {
          let transactionArr =
            importedFile.OFX.BANKMSGSRSV1.BANKTRANLIST.STMTTRN;

          if (!Array.isArray(transactionArr)) transactionArr = [transactionArr];

          for await (const transaction of transactionArr) {
            const parsedTransaction = bankOfx_parser.handle(transaction);
            parsedTransaction.id_conta = id_conta;
            parsedTransaction.id_categoria = semCategoria.id_categoria;
            parsedTransaction.id_users = req.id;

            if (
              parsedTransaction.descricao != "Pagamento recebido" &&
              !excluir
            ) {
              await Transactions.upsert(parsedTransaction, {
                fields: ["valor", "date"],
              });
            }

            if (
              parsedTransaction.descricao != "Pagamento recebido" &&
              excluir
            ) {
              await Transactions.destroy({
                where: {
                  id: parsedTransaction.id,
                },
                limit: 1,
              });
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  res.json({});
};

module.exports = {
  importFromFile,
};
