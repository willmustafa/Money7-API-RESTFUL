const ofx = require("ofx-convertjs");
const path = require("path");
const Categorias = require("../models/CategoriasModel");
const bankOfx = require("../models/Parser/bankOfx");
const Transactions = require("../models/TransactionModel");
const IgnorarNomes = require("../models/IgnorarNomesModel");
const { Op } = require("sequelize");
const bankOfx_parser = new bankOfx();

const importFromFile = async (req, res) => {
  const { id_conta, excluir } = req.body;
  if (!id_conta) return res.status(400).end();

  let semCategoria = await Categorias.findOne({
    attributes: ["id_categoria"],
    where: {
      nome: "sem categoria",
    },
    raw: true,
  });
  semCategoria = semCategoria.id_categoria;

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
            const parsedTransaction = await bankOfx_parser.handle(
              transaction,
              id_conta,
              req.id,
              semCategoria
            );

            const foundIgnorarNome = await IgnorarNomes.findAll({
              where: {
                nome: {
                  [Op.iLike]: String(parsedTransaction.descricao),
                },
                id_users: req.id,
              },
              raw: true,
            });

            let fieldsToUpdate = ["valor", "date"];
            if (parsedTransaction.id_categoria != semCategoria)
              fieldsToUpdate.push("id_categoria");

            if (!excluir && foundIgnorarNome.length == 0) {
              await Transactions.upsert(parsedTransaction, {
                fields: fieldsToUpdate,
              });
            }

            if (excluir) {
              await Transactions.destroy({
                where: {
                  id: parsedTransaction.id,
                  id_users: req.id,
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
