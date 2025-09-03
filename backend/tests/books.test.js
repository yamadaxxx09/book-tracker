require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.test') });

const request = require('supertest');
const { app, start, stop } = require('../index');

let token;

async function getToken() {
  const email = `u_${Date.now()}@example.com`;
  const payload = { username: 'tester', email, password: 'pass123' };

  const reg = await request(app).post('/api/auth/register').send(payload);
  if (reg.statusCode === 201) {
    return reg.body.token;
  }
  const login = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
  return login.body.token;
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DB_NAME = process.env.DB_NAME || 'booktracker_test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

  await start();
  token = await getToken();
  expect(token).toBeTruthy();
});

afterAll(async () => {
  await stop();
});

describe('Book Tracker API (smoke)', () => {
  test('POST /api/books -> 201', async () => {
    const res = await request(app)
      .post('/api/books')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Jest Book', author: 'Tester', genre: 'Test', rating: 4, notes: 'created by jest' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Jest Book');
  });

  test('GET /api/books -> 200 array', async () => {
    const res = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('_id');
    }
  });
});
