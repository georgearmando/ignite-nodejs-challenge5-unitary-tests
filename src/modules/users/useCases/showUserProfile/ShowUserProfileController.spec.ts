import { Connection } from "typeorm";
import request from 'supertest'

import { User } from "../../entities/User";
import { ProfileMap } from '../../mappers/ProfileMap';
import { app } from "../../../../app";
import createConnection from '../../../../database';

let connection: Connection;

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to show user profile', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '12345'
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'johndoe@example.com',
      password: '12345'
    });

    const { token } = responseToken.body;

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.body).toHaveProperty('created_at');
  });
});
