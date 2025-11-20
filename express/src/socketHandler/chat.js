import { insertMensage, obtenerMensages } from "../config/sqlite.js";

export const setupChat = (io, socket) => {
    console.log(`💬 Chat activado para: ${socket.username} (${socket.id})`);

    socket.on('request history', () => {
        // Enviar mensajes solo cuando el cliente los pide
        const mensajes = obtenerMensages.all();
        socket.emit('mensajes previos', mensajes);
        console.log(`📜 Enviados ${mensajes.length} mensajes previos a ${socket.username}`);
    });

    // Escuchar nuevos mensajes
    socket.on('chat message', (data) => {
        const info = insertMensage.run(socket.username, data.mensaje);
        const mensajeNuevo = {
            id: info.lastInsertRowid,
            usuario: socket.username,
            mensaje: data.mensaje
        };
        io.emit('chat message', mensajeNuevo);
    });

}