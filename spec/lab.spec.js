const request = require("supertest");
const app = require("..");
const { clearDatabase } = require("../db.connection");

describe("lab testing:", () => {
  let testAgent = request(app);

  afterEach(async () => {
    await clearDatabase();
  });

  describe("users routes:", () => {
    it("(GET /user/search) should respond with the correct user with the name requested", async () => {
      // Note: user name must be sent in request query not request params
      const newUser = {
        name: "Eman",
        email: "eman@test.com",
        password: "1234567",
      };
      await testAgent.post("/user/signup").send(newUser);

      const res = await testAgent.get("/user/search").query({ name: "Menna" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Menna");
    });

    it("GET /user/search with invalid name should respond with status 404 and the message", async () => {
      const res = await testAgent
        .get("/user/search")
        .query({ name: "NonExistentUser" });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain("NonExistentUser");
    });
  });

  describe("todos routes:", () => {
    it("(PATCH /todo) without title with id only should respond with res status 400 and a message", async () => {
      const newUser = {
        name: "Sara",
        email: "sara@test.com",
        password: "1234567",
      };
      await testAgent.post("/user/signup").send(newUser);
      const loginRes = await testAgent.post("/user/login").send(newUser);
      const token = loginRes.body.data;

      const todoRes = await testAgent
        .post("/todo")
        .send({ title: "original title" })
        .set({ authorization: token });
      const todoId = todoRes.body.data._id;

      const res = await testAgent
        .patch("/todo/" + todoId)
        .send({})
        .set({ authorization: token });
      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it("(PATCH /todo) with id and title should respond with status 200 and the new todo", async () => {
      const newUser = {
        name: "Sara",
        email: "sara@test.com",
        password: "1234567",
      };
      await testAgent.post("/user/signup").send(newUser);
      const loginRes = await testAgent.post("/user/login").send(newUser);
      const token = loginRes.body.data;

      const todoRes = await testAgent
        .post("/todo")
        .send({ title: "old title" })
        .set({ authorization: token });
      const todoId = todoRes.body.data._id;

      const res = await testAgent
        .patch("/todo/" + todoId)
        .send({ title: "new title" })
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("new title");
    });

    it("(GET /todo/user) should respond with the user's all todos", async () => {
      const newUser = {
        name: "Mona",
        email: "mona@test.com",
        password: "1234567",
      };
      await testAgent.post("/user/signup").send(newUser);
      const loginRes = await testAgent.post("/user/login").send(newUser);
      const token = loginRes.body.data;

      await testAgent
        .post("/todo")
        .send({ title: "todo 1" })
        .set({ authorization: token });
      await testAgent
        .post("/todo")
        .send({ title: "todo 2" })
        .set({ authorization: token });

      const res = await testAgent
        .get("/todo/user")
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveSize(2);
    });

    it("(GET /todo/user) for a user hasn't any todo, should respond with status 200 and a message", async () => {
      const newUser = {
        name: "Omar",
        email: "omar@test.com",
        password: "1234567",
      };
      await testAgent.post("/user/signup").send(newUser);
      const loginRes = await testAgent.post("/user/login").send(newUser);
      const token = loginRes.body.data;

      const res = await testAgent
        .get("/todo/user")
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });
});
