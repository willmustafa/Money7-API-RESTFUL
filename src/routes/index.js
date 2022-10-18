const cartoesRoute = require("./cartoes");
const usersRoute = require("./users");
const transacoesRoute = require("./transacoes");
const contasRoute = require("./contas");
const objetivosRoute = require("./objetivos");
const categoriasRoute = require("./categorias");
const instituicoesRoute = require("./instituicoes");
const transacoesFiltradasRoute = require("./transacoesFiltradas");
const contasFiltradasRoute = require("./contasFiltradas");
const importRoute = require("./import");
const tagsRoute = require("./tags");
const verifyJWT = require("../controllers/verifyJWT");
const TransacoesFuturas = require("./transacoesFuturas");
const IgnorarNomes = require("./ignorarNomes");

module.exports = function (app) {
  app.get("/", async (req, res) => {
    res.json({ message: "API Working!" });
  });

  app.use("/users", usersRoute);

  app.use(verifyJWT);
  app.use("/transacoes", transacoesRoute);
  app.use("/transacoesFiltradas", transacoesFiltradasRoute);
  app.use("/contas", contasRoute);
  app.use("/contasFiltradas", contasFiltradasRoute);
  app.use("/objetivos", objetivosRoute);
  app.use("/cartoes", cartoesRoute);
  app.use("/categorias", categoriasRoute);
  app.use("/instituicoes", instituicoesRoute);
  app.use("/import", importRoute);
  app.use("/tags", tagsRoute);
  app.use("/transacoesFuturas", TransacoesFuturas);
  app.use("/ignorarNomes", IgnorarNomes);
};
