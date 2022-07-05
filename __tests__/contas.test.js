const request = require('supertest')
const app = require('../src/index')

describe('Get a list of Contas', () => {
	it('should get a 200 status', async () => {
		const response = await request(app).get('/contas/')
		expect(response.statusCode).toEqual(200)
	})

	it('should get a 200 status', async () => {
		const response = await request(app).get('/contas/1')
		expect(response.statusCode).toEqual(200)
	})
})
