const userConfig = require("./userConfig");
const request = require("supertest");
const app = require("../src/index");

let token = null;

beforeAll(async function () {
  const response = await request(app).post("/users/login").send(userConfig);
  token = response.body.accessToken;
});

describe("Get a list of contas", () => {
  it("should get a 200 status from getAll", async () => {
    const response = await request(app)
      .get("/contas/")
      .query({ date: new Date().toISOString() })
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from given ID", async () => {
    const response = await request(app)
      .get("/contas/1")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe("Create, edit and delete a contas", () => {
  let id = null;

  it("should get a 200 status from trying to post a cartao", async () => {
    const response = await request(app)
      .post("/contas/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        saldo: 1000,
        date: new Date().toISOString(),
        id_instituicao: 1,
        id_users: "1",
      });
    expect(response.statusCode).toEqual(200);
    id = response.body.id_conta;
  });

  it("should get a 200 status from trying to edit a cartao", async () => {
    const response = await request(app)
      .put(`/contas/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        saldo: 2000,
        date: new Date().toISOString(),
        id_instituicao: 1,
        id_users: "1",
      });
    expect(response.statusCode).toEqual(200);
  });

  it("should get a 200 status from trying to delete a cartao", async () => {
    const response = await request(app)
      .delete(`/contas/${id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(200);
  });
});

describe("Fail tests to route contas", () => {
  it("should get a 400 status from wrong given ID", async () => {
    const response = await request(app)
      .get("/contas/wrong")
      .set("Authorization", `Bearer ${token}`);
    expect(response.statusCode).toEqual(204);
  });

  it("should get a 401 from not passing the auth token", async () => {
    const response = await request(app).get("/contas/");
    expect(response.statusCode).toEqual(401);
  });
});
