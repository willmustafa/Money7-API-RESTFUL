const userConfig = require("./userConfig");
const request = require("supertest");
const app = require("../src/index");

let token = null;

beforeAll(async function () {
  const response = await request(app).post("/users/login").send(userConfig);
  token = response.body.accessToken
});

describe("Get a list of Categorias", () => {

  it("should get a 200 status from getAll", async () => {
    const response = await request(app).get("/categorias/").set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from given ID", async () => {
    const response = await request(app).get("/categorias/1").set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe("Create, edit and delete a Categorias", () => {
	let id = null

	it("should get a 200 status from trying to post a category", async () => {
	  const response = await request(app).post("/categorias/")
	  .set('Authorization', `Bearer ${token}`)
	  .send({
		nome: 'test',
		cor: 'test',
		icone: 'test',
		tipo: 'test',
		id_users: '1'
	  });
	  expect(response.statusCode).toEqual(200);
	  id = response.body.id_categoria
	});

	it("should get a 200 status from trying to edit a category", async () => {
		const response = await request(app).put(`/categorias/${id}`)
		.set('Authorization', `Bearer ${token}`)
		.send({
		  nome: 'test2',
		  cor: 'test2',
		  icone: 'test2',
		  tipo: 'test2',
		  id_users: '1'
		});
		expect(response.statusCode).toEqual(200);
	});

	it("should get a 200 status from trying to delete a category", async () => {
		const response = await request(app).delete(`/categorias/${id}`)
		.set('Authorization', `Bearer ${token}`);
		expect(response.statusCode).toEqual(200);
	});
});

describe("Fail tests to route Categorias", () => {

	it("should get a 400 status from wrong given ID", async () => {
	  const response = await request(app).get("/categorias/wrong").set('Authorization', `Bearer ${token}`);
	  expect(response.statusCode).toEqual(400);
	});
  
	it("should get a 401 from not passing the auth token", async () => {
	  const response = await request(app).get("/categorias/wrong");
	  expect(response.statusCode).toEqual(401);
	});
});
  