const userConfig = require("./userConfig");
const request = require("supertest");
const app = require("../src/index");

let token = null;

beforeAll(async function () {
  const response = await request(app).post("/users/login").send(userConfig);
  token = response.body.accessToken;
});

describe("Get a list of objetivos", () => {
  it("should get a 200 status from getAll", async () => {
    const response = await request(app)
      .get("/objetivos/")
      .query({ date: new Date().toISOString() })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from given ID", async () => {
    const response = await request(app)
      .get("/objetivos/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe("Create, edit and delete a objetivos", () => {
  let id = null;

  it("should get a 200 status from trying to post a objetivo", async () => {
    const response = await request(app)
      .post("/objetivos/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Teste",
        cor: "teste",
        valor: 1000,
        description: "teste",
        id_categoria: 1,
        date: new Date().toISOString(),
        id_users: "1",
      });
    expect(response.statusCode).toEqual(200);
    id = response.body.id_objetivo;
  });

  it("should get a 200 status from trying to edit a objetivo", async () => {
    const response = await request(app)
      .put(`/objetivos/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        titulo: "Teste2",
        cor: "teste2",
        valor: 1000,
        description: "teste",
        id_categoria: 1,
        date: new Date().toISOString(),
        id_users: "1",
      });
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from trying to delete a cartao", async () => {
    console.log(id);
    const response = await request(app)
      .delete(`/objetivos/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe("Fail tests to route objetivos", () => {
  it("should get a 400 status from wrong given ID", async () => {
    const response = await request(app)
      .get("/objetivos/wrong")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(204);
  });

  it("should get a 401 from not passing the auth token", async () => {
    const response = await request(app).get("/objetivos/");
    expect(response.statusCode).toEqual(401);
  });
});
