const request = require('supertest');
const app = require('../src/index');

describe('Get a list of Transactions', () => {
  it('should get a 200 status', async () => {
    const response = await request(app).get('/transacoes/');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status', async () => {
    const response = await request(app).get('/transacoes/byId/1');
    expect(response.statusCode).toEqual(200);
  });
});

describe('Get a list of Transactions Categories', () => {
  it('should get a 200 status from Soma Mes', async () => {
    const response = await request(app).get('/transacoes/somaMes');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from balanco Mensal', async () => {
    const response = await request(app).get('/transacoes/balancoMensal');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from gastos Receitas Mensal', async () => {
    const response = await request(app).get('/transacoes/gastosReceitasMensal');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from despesa Categoria', async () => {
    const response = await request(app).get('/transacoes/despesaCategoria');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from receita Categoria', async () => {
    const response = await request(app).get('/transacoes/receitaCategoria');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from pendencias', async () => {
    const response = await request(app).get('/transacoes/pendencias');
    expect(response.statusCode).toEqual(200);
  });
});
