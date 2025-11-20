import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
//import https from 'https';
import cors from "cors";

import connectDB from './src/config/database.js';
import morgan from 'morgan';
//import path from 'path';
//import fs from 'fs';
import http from 'http';
//import { fileURLToPath } from 'url';
import { setupSocket } from './src/socketHandler/socket.js';
import { Server } from 'socket.io'
import { sessionMiddleware } from './src/middlewares/auth.js';
import { login } from './src/controllers/login.js'
import { register } from './src/controllers/register.js'

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000

//HTTP SERVER
const app = express();
const server = http.createServer(app);

//CONFIG IO
const io = new Server(server, {
  cors: { 
    origin:['http://localhost:3000', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

//DB CONEXION


connectDB();


//MIDELWARESS

app.use(morgan('dev'));


app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(sessionMiddleware);

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'");
    next();
  });

//SERVIR ARCHIVOS ESTATICOS
//app.use(express.static((path.join(__dirname, 'dist'))));


//ROUTING
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

// SERVIR REACT PARA TODAS LAS DEMÁS RUTAS
/* app.get(/^(?!.*\.).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
}); */

// Compartir sesión con Socket.IO
io.engine.use(sessionMiddleware);

// Configurar Socket.IO con autenticación
setupSocket(io);


server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));