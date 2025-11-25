import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './src/app.js';
import { setupSocket } from './src/socketHandler/socket.js';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  const { app, sessionMiddleware } = await createApp(MONGO_URI);

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin:['http://localhost:3000', 'http://localhost:5173'],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.engine.use(sessionMiddleware);

  setupSocket(io);

  server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
};

startServer();
