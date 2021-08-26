const request = require('supertest');

const app = require('../app');
const database = require('../src/database');

const USERS_PATH = '/users';

const FAKE_USER = {
  username: 'myusername',
  name: 'Tester user',
  email: 'tester@test.com',
};

describe('Users routes', () => {
  beforeAll(async () => {
    await database.init();
  });

  it('Should create user', async () => {
    const payload = {
      password: '12345',
      passwordConfirmation: '12345',
      ...FAKE_USER,
    };
    const response = await request(app).post(USERS_PATH).send(payload);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');

    expect(response.body.data.name).toBe(payload.name);
    expect(response.body.data.username).toBe(payload.username);
    expect(response.body.data.email).toBe(payload.email);

    expect(response.body.data.password).toBeUndefined();
    expect(response.body.data.passwordConfirmation).toBeUndefined();
  });

  it('Should return bad request with invalid payload', async () => {
    const payload = {
      password: '12345',
      passwordConfirmation: '12345',
    };
    const response = await request(app).post(USERS_PATH).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe('Payload must contain name, username, email and password');
  });

  it('Should return bad request with missmatch passwords', async () => {
    const payload = {
      password: '12',
      passwordConfirmation: '12345',
      ...FAKE_USER,
    };
    const response = await request(app).post(USERS_PATH).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe('Passwords do not match');
  });

  it('Should get user by id', async () => {
    const USER_ID = 1;
    const response = await request(app).get(`${USERS_PATH}/${USER_ID}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');

    expect(response.body.data.name).toBe(FAKE_USER.name);
    expect(response.body.data.username).toBe(FAKE_USER.username);
    expect(response.body.data.email).toBe(FAKE_USER.email);

    expect(response.body.data.password).toBeUndefined();
    expect(response.body.data.passwordConfirmation).toBeUndefined();
  });

  it('Should return bad request when user not found', async () => {
    const USER_ID = 2;
    const response = await request(app).get(`${USERS_PATH}/${USER_ID}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe('User not found');
  });
});