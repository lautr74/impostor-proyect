import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app';

describe('Auth routes', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const { app: createdApp } = await createApp(mongoUri);
    app = createdApp;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return { autenticado: false } when session is not present', async () => {
    const response = await request(app).get('/verificar-sesion');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ autenticado: false });
  });
});
