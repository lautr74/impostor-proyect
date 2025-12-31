// src/config/database.js
import Database from 'better-sqlite3';

let db;

try {
  // Intentamos abrir/crear la DB
  db = new Database('chat.db', { verbose: console.log });

  // Intentamos crear la tabla
  db.exec(`
    CREATE TABLE IF NOT EXISTS mensajes(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log("✅ Conexión a SQLite exitosa y tabla verificada.");

} catch (err) {
  console.error("❌ Error crítico al inicializar la base de datos:");
  console.error(err.message);
  
  // En este punto, como la DB es vital, lo mejor suele ser cerrar el proceso
  process.exit(1); 
}

// Preparar queries
export const insertMensage = db.prepare('INSERT INTO mensajes (usuario, mensaje) VALUES(?,?)');
export const obtenerMensages = db.prepare('SELECT * FROM mensajes ORDER BY id ASC LIMIT 50');
export const omensageById = db.prepare('SELECT * FROM mensajes WHERE id = ?');
export const delateMensage = db.prepare('DELETE FROM mensajes WHERE id = ?');

