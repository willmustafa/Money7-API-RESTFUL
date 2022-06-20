const request = require('supertest');
const app = require('../src/index');

describe('Get a list of Objetivos', () => {
  it('should get a 200 status', async () => {
    const response = await request(app).get('/objetivos/');
    expect(response.statusCode).toEqual(200);
  });

  it('should get a 200 status from given ID', async () => {
    const response = await request(app).get('/objetivos/byId/2');
    expect(response.statusCode).toEqual(200);
  });
});
