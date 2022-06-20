const cartoesRoute = require('./cartoes');
const usersRoute = require('./users');
const transacoesRoute = require('./transacoes');
const contasRoute = require('./contas');
const objetivosRoute = require('./objetivos');
const categoriasRoute = require('./categorias');

module.exports = function (app) {
  app.get('/', async (req, res) => {
    res.json({ message: 'API Working!' });
  });

  app.use('/users', usersRoute);
  app.use('/transacoes', transacoesRoute);
  app.use('/contas', contasRoute);
  app.use('/objetivos', objetivosRoute);
  app.use('/cartoes', cartoesRoute);
  app.use('/categorias', categoriasRoute);
};
