const request = require('supertest');
const app = require('./app');

describe('GET /', () => {
  it('debería responder con un mensaje de saludo', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hola, esto es una prueba de Express con Jest!');
  });
});
