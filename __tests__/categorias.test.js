const request = require('supertest');
const app = require('../src/index');

describe('Get a list of Categorias', () => {
  it('should get a 200 status', async () => {
    const response = await request(app).get('/categorias/');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status', async () => {
    const response = await request(app).get('/categorias/byId/1');
    expect(response.statusCode).toEqual(200);
  });
});
