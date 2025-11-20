import { setupChat } from "./chat.js";
import { setupImpostor, manejarDesconexion, partida} from "./impostor.js";

export const setupSocket = (io) => {
    
    // Middleware de autenticación
    io.use((socket, next) => {
        const session = socket.request.session;
        
        if (!session || !session.userId) {
            return next(new Error('No autorizado'));
        }
        
        // Guardar datos del usuario en el socket
        socket.userId = session.userId;
        socket.username = session.usuario;
        next();
    });

    // Cuando un usuario se conecta
    io.on('connection', (socket) => {
        console.log(`✅ Nuevo usuario conectado: ${socket.username} (${socket.id})`);

        // Configurar módulo de chat; 
        setupChat(io, socket);
        

        // Configurar módulo de juego
        setupImpostor(io, socket);

        // Desconexión
        socket.on('disconnect', () => {3
            console.log(`❌ Usuario desconectado: ${socket.username} (${socket.id})`);

            const wasInGame = manejarDesconexion(socket.id);
            if(wasInGame){
                io.emit('sala actualizada', {
                    jugadores: partida.jugadores,
                    estado: partida.estado
                })
            }
        });
    });
};