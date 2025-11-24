import express from 'express';
import cors from "cors";
import morgan from 'morgan';
import { createSessionMiddleware } from './middlewares/auth.js';
import { login } from './controllers/login.js';
import { register } from './controllers/register.js';
import connectDB from './config/database.js';

export const createApp = async (mongoUrl) => {
  await connectDB(mongoUrl);

  const app = express();

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
  }));

  const sessionMiddleware = createSessionMiddleware(mongoUrl);
  app.use(sessionMiddleware);

  app.use((req, res, next) => {
      res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'");
      next();
    });

  app.post('/registro', register);
  app.post('/login', login)
  app.get('/verificar-sesion', (req, res) => {
    if (req.session.userId) {
      res.json({
        autenticado: true,
        userId: req.session.userId,
        userName: req.session.usuario
      });
    } else {
      res.json({ autenticado: false });
    }
  });

  return { app, sessionMiddleware };
}
