/*
Arquivo para fazer a importações de modelos no banco de dados.
Adicione novos modelos com require e adicione a variável no export
para criar a tabela no banco de dados.
*/
const cartoes = require("./CartoesModel");
const categorias = require("./CategoriasModel");
const contas = require("./ContasModel");
const instituicoes = require("./InstituicoesModel");
const objetivos = require("./ObjetivosModel");
const transactions = require("./TransactionModel");
const users = require("./UsersModel");
const tags = require("./TagsModel");
const TransacoesFuturas = require("./TransacoesFuturas");
const IgnorarNomes = require("./IgnorarNomesModel");

module.exports = {
  cartoes,
  categorias,
  contas,
  instituicoes,
  objetivos,
  transactions,
  users,
  tags,
  TransacoesFuturas,
  IgnorarNomes,
};
