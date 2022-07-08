const userConfig = require("./userConfig");
const request = require("supertest");
const app = require("../src/index");

let token = null;

beforeAll(async function () {
  const response = await request(app).post("/users/login").send(userConfig);
  token = response.body.accessToken
});

describe("Get a list of Cartoes", () => {

  it("should get a 200 status from getAll", async () => {
    const response = await request(app).get("/cartoes/")
	.query({date: new Date().toISOString()})
	.set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from given ID", async () => {
    const response = await request(app).get("/cartoes/1").set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});


describe("Create, edit and delete a cartoes", () => {
	let id = null

	it("should get a 200 status from trying to post a cartao", async () => {
	  const response = await request(app).post("/cartoes/")
	  .set('Authorization', `Bearer ${token}`)
	  .send({
		vencimento: 10,
		fechamento: 10,
		limite: 1000,
		id_instituicao: 1,
		id_users: '1'
	  });
	  expect(response.statusCode).toEqual(200);
	  id = response.body.id_cartao
	});

	it("should get a 200 status from trying to edit a cartao", async () => {
		const response = await request(app).put(`/cartoes/${id}`)
		.set('Authorization', `Bearer ${token}`)
		.send({
			vencimento: 15,
			fechamento: 15,
			limite: 5000,
			id_instituicao: 1,
			id_users: '1'
		});
		expect(response.statusCode).toEqual(200);
	});

	it("should get a 200 status from trying to delete a cartao", async () => {
		const response = await request(app).delete(`/cartoes/${id}`)
		.set('Authorization', `Bearer ${token}`);
		expect(response.statusCode).toEqual(200);
	});
});

describe("Fail tests to route cartoes", () => {

	it("should get a 400 status from wrong given ID", async () => {
	  const response = await request(app).get("/cartoes/wrong").set('Authorization', `Bearer ${token}`);
	  expect(response.statusCode).toEqual(204);
	});
  
	it("should get a 401 from not passing the auth token", async () => {
	  const response = await request(app).get("/cartoes/");
	  expect(response.statusCode).toEqual(401);
	});
});