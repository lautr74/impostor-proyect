// src/config/database.js
import Database from 'better-sqlite3';

const db = new Database('chat.db');

// Crear tabla
db.exec(`
  CREATE TABLE IF NOT EXISTS mensajes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Preparar queries
export const insertMensage = db.prepare('INSERT INTO mensajes (usuario, mensaje) VALUES(?,?)');
export const obtenerMensages = db.prepare('SELECT * FROM mensajes ORDER BY id ASC LIMIT 50');
export const omensageById = db.prepare('SELECT * FROM mensajes WHERE id = ?');
export const delateMensage = db.prepare('DELETE FROM mensajes WHERE id = ?');

