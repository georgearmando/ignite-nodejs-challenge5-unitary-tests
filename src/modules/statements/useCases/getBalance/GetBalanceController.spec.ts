import { hash } from "bcryptjs";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("12345", 8);

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('${id}', 'John Doe', 'johndoe@example.com', '${password}', 'now()', 'now()')
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get account balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
      .send({
        email: "johndoe@example.com",
        password: "12345",
      });

    const { token } = responseToken.body;

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 300,
      description: "Depositing $300",
    }).set({
      Authorization: `Bearer ${token}`,
    });

    await request(app).post("/api/v1/statements/withdraw").send({
      amount: 100,
      description: "Withdrawing $100",
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`,
    });

    console.log(response.body)

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  });
});
