import { Connection } from "typeorm";
import request from "supertest";
import { v4 as uuid } from 'uuid';
import { hash } from "bcryptjs";

import { app } from "../../../../app";
import createConnection from '../../../../database';

let connection: Connection;

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
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
  });

  it('Should be able to get a statement operation', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@example.com',
      password: '12345'
    });

    const { token } = responseToken.body;

    const statementResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 300,
      description: 'Wage'
    }).set({
      Authorization: `Bearer ${token}`,
    });

    const { id } = statementResponse.body;

    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200)
  });
});
