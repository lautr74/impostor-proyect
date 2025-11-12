import { insertMensage, obtenerMensages } from "../config/sqlite.js";

export const setupChat = (io, socket) => {
    console.log(`💬 Chat activado para: ${socket.username} (${socket.id})`);

    // Mostrar mensajes previos
    const mensajes = obtenerMensages.all();
    socket.emit('mensajes previos', mensajes);

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