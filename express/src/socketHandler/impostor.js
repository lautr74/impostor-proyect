export const partida = {
    jugadores: [],
    estado: "esperando",
    impostor: null,
    palabraSecreta: null,
    categoria: null,
    rondaActual: 1,
    pistas: [],
    pistasAnteriores: [],
    ordenTurnos: [],
    turnoActual: 0,
    votos: {},
    ganador: null,
    impostorNombre: null,
    eliminados: []  
}

const palabras ={
 futbolistas:  [  'Messi', 'Cristiano Ronaldo', 'Neymar', 'Mbappé', 'Haaland', 
    'Benzema', 'Lewandowski', 'Salah', 'De Bruyne', 'Modric',
    'Vinicius Jr', 'Pedri', 'Gavi', 'Bellingham', 'Kane',
    'Musiala', 'Saka', 'Foden', 'Hojlund', 'Osimhen',
    'Griezmann', 'Courtois', 'Ter Stegen', 'Alisson', 'Rodri',
    'Casemiro', 'Bruno Fernandes', 'Son', 'Ramos', 'Van Dijk'
],

 objetos: [
    'Mesa', 'Silla', 'Lámpara', 'Teclado', 'Reloj', 
    'Paraguas', 'Teléfono', 'Botella', 'Cuchara', 'Tenedor',
    'Plato', 'Vaso', 'Almohada', 'Manta', 'Libro',
    'Lápiz', 'Cuaderno', 'Mochila', 'Gafas', 'Espejo',
    'Cepillo', 'Peine', 'Tijeras', 'Regla', 'Calculadora',
    'Auriculares', 'Cargador', 'Llave', 'Cartera', 'Zapato'
]
}


//ELIMINAR JUGADOR POR VOTACIÓN
export const eliminarJugador = (socketId, io) => {
    const jugadorIndex = partida.jugadores.findIndex(x => x.id === socketId);

    if (jugadorIndex !== -1) {
        const jugadorEliminado = partida.jugadores[jugadorIndex];
        
        partida.eliminados.push(socketId);

        // Notificar al jugador que fue eliminado
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.connected) {
            socket.emit('fuiste eliminado', {
                nombre: jugadorEliminado.nombre,
                ronda: partida.rondaActual
            });
            console.log(`📤 Notificado a ${jugadorEliminado.nombre} que fue eliminado por votación`);
        }

        partida.jugadores.splice(jugadorIndex, 1);
        console.log(`❌ ${jugadorEliminado.nombre} eliminado por votación`);
        return true;
    }
    return false;
};


//MANEJAR DESCONEXIÓN
export const manejarDesconexion = (socketId) => {
    const jugadorIndex = partida.jugadores.findIndex(x => x.id === socketId);

    if (jugadorIndex !== -1) {
        const jugadorDesconectado = partida.jugadores[jugadorIndex];
        
        partida.eliminados.push(socketId);
        partida.jugadores.splice(jugadorIndex, 1);
        
        console.log(`🔌 ${jugadorDesconectado.nombre} se desconectó y fue removido del juego`);
        return true;
    }
    return false;
};

const estaEliminado = (socketId) => {
    return partida.eliminados.includes(socketId);
};
/////////////////////
//FUNCION PRINCIPAL//
////////////////////
export const setupImpostor = (io,socket) => {
    console.log(`🎮 Jugador unido al juego: ${socket.username} (${socket.id})`);

    const jugador = {
        id: socket.id,
        nombre: socket.username,
        listo: false,
        categoria: null,
    }

    partida.jugadores.push(jugador);
    console.log(`👥 Jugadores en sala: ${partida.jugadores.length}`)
    console.log('emitiendo sala actualizada');
    io.emit('sala actualizada', {
        jugadores: partida.jugadores,
        estado: partida.estado
    })

    // ✅ NUEVO: Listener para solicitar estado actual
    socket.on('solicitar estado fase', () => {
        console.log(`📥 ${socket.username} solicitó estado de fase`);
        
        if (partida.estado === 'jugando' && partida.ordenTurnos.length > 0) {
            // Enviar estado actual al jugador que lo solicita
            socket.emit('fase pistas', {
                ordenTurnos: partida.ordenTurnos,
                turnoActual: partida.ordenTurnos[partida.turnoActual]
            });
            
            // También enviar las pistas que ya se dieron
            if (partida.pistas.length > 0) {
                partida.pistas.forEach(pista => {
                    socket.emit('nueva pista', pista);
                });
            }
            
            console.log(`📤 Estado enviado a ${socket.username}:`, {
                turnoActual: partida.turnoActual,
                pistasCount: partida.pistas.length
            });
        } else {
            console.log(`⚠️ No hay fase activa para enviar a ${socket.username}`);
        }
    });

    socket.on('solicitar estado sala', () => {
    console.log(`📥 ${socket.username} solicitó estado de sala`);
    
    socket.emit('sala actualizada', {
        jugadores: partida.jugadores,
        estado: partida.estado
    });
    });

     socket.on('solicitar estado votacion', () => {
        console.log(`📥 ${socket.username} solicitó estado de votación`);
        
        if (partida.estado === 'votando') {
            // Enviar estado actual de la votación
            socket.emit('iniciando votacion', {
                jugadores: partida.jugadores,
                pistas: partida.pistas
            });
            
            // Enviar votos actuales si ya hay algunos
            if (Object.keys(partida.votos).length > 0) {
                socket.emit('votos actualizados', partida.votos);
            }
            
            console.log(`📤 Estado de votación enviado a ${socket.username}`);
        } else {
            console.log(`⚠️ No hay votación activa para ${socket.username}`);
        }
    });

    socket.on('solicitar estado finalizado', () => {
        console.log(`📥 ${socket.username} solicitó estado finalizado`);
    
         if (partida.estado === 'finalizado') {
        // Enviar el resultado
        
            socket.emit('juego finalizado', {
                ganador: partida.ganador, // Necesitamos guardar esto
                impostor: partida.impostorNombre,
                palabraSecreta: partida.palabraSecreta
            });
        
            console.log(`📤 Estado finalizado enviado a ${socket.username}`);
        } else {
            console.log(`⚠️ No hay juego finalizado para ${socket.username}`);
        }
});

    socket.on('votar categoria', (categoriaVotada) => {
        const jugador = partida.jugadores.find(x => x.id === socket.id);

        if(jugador){
            jugador.categoria = categoriaVotada;
        }
        
        io.emit('sala actualizada', {
            jugadores: partida.jugadores,
            estado: partida.estado
        });
    })

    socket.on('marcar listo', () => {
        const player = partida.jugadores.find(x => x.id === socket.id);
        
        if(!player) return;
        
        player.listo = true;

        io.emit('sala actualizada', {
            jugadores: partida.jugadores,
            estado: partida.estado
        })

        const todosListos = partida.jugadores.every(j => j.listo === true);
        const min4 = partida.jugadores.length >= 4;

        if(todosListos && min4){
            iniciarPartida(io)
        }
    })

    socket.on('enviar pista', (pista) => {

         if (estaEliminado(socket.id)) {
        console.log(`⛔ ${socket.username} está eliminado, no puede enviar pista`);
        return;
        }

        if(partida.estado !== 'jugando' ){
            console.log('⚠️ Pista rechazada: estado no es jugando');
            return
        }
        
        const jugadorActual = partida.ordenTurnos[partida.turnoActual];
        const esMiTurno = jugadorActual?.id === socket.id;

        if(!esMiTurno){
            console.log(`⚠️ Pista rechazada: no es el turno de ${socket.username}`);
            return;
        }

        // Guardar la pista
        const nuevaPista = {
            jugadorId: socket.id,
            jugadorNombre: socket.username,
            pista: pista
        };
        
        partida.pistas.push(nuevaPista);
        
        console.log(`📝 Pista añadida (${partida.pistas.length}/${partida.jugadores.length}):`, nuevaPista);

        // Emitir la pista que acabamos de añadir
        io.emit('nueva pista', nuevaPista);

        // Incrementar turno
        partida.turnoActual++;

        // Verificar si todos han dado su pista
        if(partida.turnoActual == partida.jugadores.length){
            console.log('🗳️ Todos dieron pistas, iniciando votación');
            iniciarVotacion(io);
        }
        else{
            const siguienteTurno = partida.ordenTurnos[partida.turnoActual];
            console.log('➡️ Siguiente turno:', siguienteTurno);
            
            io.emit('nuevo turno', {
                nuevoTurno: siguienteTurno
            })
        }

    }) 

    socket.on('votar', (voto) => {

        if (estaEliminado(socket.id)) {
        console.log(`⛔ ${socket.username} está eliminado, no puede votar`);
        return;
        }
        if(partida.estado !== 'votando'){
            console.log('⚠️ Voto rechazado: no es fase de votación');
            return
        }

        partida.votos[socket.id] = voto;
        
        console.log(`🗳️ Voto registrado: ${socket.username} votó por ${voto}`);
        console.log(`Votos actuales: ${Object.keys(partida.votos).length}/${partida.jugadores.length}`);

        io.emit('votos actualizados', partida.votos);

        if(Object.keys(partida.votos).length === partida.jugadores.length){
            console.log('✅ Todos votaron, haciendo recuento');
            recuentoVotos(io);
        }
    })
}

const elegirAleatorio = (array) => {
    const aleatorio = array[Math.floor(Math.random() * array.length)];
    return aleatorio 
}  

const iniciarPartida = (io) => {
    const futbol = partida.jugadores.filter(x => x.categoria === 'futbolistas').length;
    const otros = partida.jugadores.filter(x => x.categoria === 'objetos').length;

    if(futbol > otros){
        partida.categoria = 'futbolistas'
    }
    else{
        partida.categoria = 'objetos'
    };

    partida.impostor = elegirAleatorio(partida.jugadores).id;
    partida.palabraSecreta = elegirAleatorio(palabras[partida.categoria])
    partida.estado = 'jugando';
    partida.rondaActual = 1;
    partida.turnoActual = 0; // ✅ Asegurar que comienza en 0

    console.log('🎮 INICIANDO PARTIDA');
    console.log('📝 Categoría:', partida.categoria);
    console.log('🎯 Palabra secreta:', partida.palabraSecreta);
    console.log('🎭 Impostor:', partida.jugadores.find(j => j.id === partida.impostor)?.nombre);

    partida.jugadores.forEach(jugador => {
        const socket = io.sockets.sockets.get(jugador.id);

        if (socket) {
            if (jugador.id === partida.impostor) {
                socket.emit('rol asignado', {
                    esImpostor: true,
                    categoria: partida.categoria
                });
            } else {
                socket.emit('rol asignado', {
                    esImpostor: false,
                    palabraSecreta: partida.palabraSecreta,
                    categoria: partida.categoria
                });
            }
        }
    });

    partida.ordenTurnos = partida.jugadores.map(j => ({
        id: j.id,
        nombre: j.nombre
    }));

    console.log('📋 Jugadores:', partida.jugadores.map(j => ({ id: j.id, nombre: j.nombre })));
    console.log('🔄 Orden turnos:', partida.ordenTurnos);
    console.log('▶️ Primer turno:', partida.ordenTurnos[0]);

    // ✅ MEJORADO: Pequeño delay antes de emitir fase pistas
    // Esto da tiempo a que los componentes se monten
    setTimeout(() => {
        io.emit('fase pistas',{
            ordenTurnos: partida.ordenTurnos,
            turnoActual: partida.ordenTurnos[0]
        });
        console.log('📤 Evento "fase pistas" emitido a todos');
    }, 100);
};

const iniciarVotacion = (io) => {
    console.log('🗳️ INICIANDO VOTACIÓN');
    console.log('Pistas de esta ronda:', partida.pistas);
    console.log('Jugadores que van a votar:', partida.jugadores.length);
    
    partida.estado = 'votando';
    partida.votos = {};


    setTimeout(() => {
        io.emit('iniciando votacion', {
            jugadores: partida.jugadores,
            pistas: partida.pistas
        });
        
        console.log('📤 Evento "iniciando votacion" emitido a todos los clientes');
    }, 500); // 500ms de delay
}

const recuentoVotos = (io) => {
    const contador = {};

    Object.values(partida.votos).forEach(value => {
        if(contador[value]){
            contador[value]++
        }
        else{
            contador[value] = 1;
        }
    })

    let maxVotos = 0;
    let masVotado = null;

    for(const id in contador){
        if(contador[id] > maxVotos){
            maxVotos = contador[id];
            masVotado = id
        }
    }

    // Si no hay masVotado (empate o sin votos) -> no eliminar, iniciar nueva ronda o manejar empate
    if(!masVotado){
        console.log('⚖️ Empate o sin votos en la votación, no se elimina a nadie. Iniciando nueva ronda.');
        io.emit('empate votos', { votos: partida.votos });
        // Reiniciar votos y seguir a nueva ronda
        partida.votos = {};
        nuevaRonda(io);
        return;
    }

    const jugadorEliminado = partida.jugadores.find(j => j.id === masVotado) || { nombre: 'Desconocido' };

    console.log('🎯 Jugador más votado:', jugadorEliminado?.nombre, 'con', maxVotos, 'votos');

    partida.impostorNombre = partida.jugadores.find(j => j.id === partida.impostor)?.nombre || 'Desconocido';
    // Pasar io a removePlayer
    eliminarJugador(masVotado, io);

    // Pequeño delay para que el jugador reciba la notificación de eliminación primero
    setTimeout(() => {
        io.emit("jugador eliminado", {
            jugador: jugadorEliminado.nombre,
            votos: maxVotos
        })

        if(masVotado === partida.impostor){
            console.log('✅ ¡GANARON LOS JUGADORES! Eliminaron al impostor');
            finalizarJuego(io, "jugadores", partida.impostorNombre);
        } else {
            // comprobar condición de victoria del impostor tras la eliminación
            if(partida.jugadores.length === 2){
                const nombreJugador = partida.jugadores.find(j => j.id === partida.impostor)?.nombre || 'Desconocido';
                console.log('✅ ¡GANÓ EL IMPOSTOR! Solo quedan 2 jugadores');
                finalizarJuego(io, "impostor", nombreJugador)
            } else {
                console.log('➡️ Continuando a nueva ronda...');
                nuevaRonda(io)
            }
        }
    }, 200);  // Delay de 200ms
}


const finalizarJuego = (io, ganador, nombreJugador) => {
    partida.estado = 'finalizado';
    partida.ganador = ganador; // ✅ Guardar
    partida.impostorNombre = nombreJugador; // ✅ Guardar

    console.log('🏆 JUEGO FINALIZADO');
    console.log('Ganador:', ganador);
    console.log('Impostor era:', nombreJugador);
    console.log('Palabra secreta era:', partida.palabraSecreta);


    io.emit('juego finalizado', {
        ganador: ganador,
        impostor: nombreJugador,
        palabraSecreta: partida.palabraSecreta
    })

    setTimeout(() => {
        console.log('🔄 Reseteando partida...');
        resetearPartida(io)
    }, 60000)
}

const resetearPartida = (io) => {
   
    const jugadoresConectados = partida.jugadores.map(j => ({
        id: j.id,
        nombre: j.nombre,
        listo: false,
        categoriaVotada: null
    }));

    partida.jugadores = jugadoresConectados;
    partida.estado = 'esperando';
    partida.impostor = null;
    partida.palabraSecreta = null;
    partida.categoria = null;
    partida.rondaActual = 1;
    partida.pistas = [];
    partida.pistasAnteriores = [];
    partida.ordenTurnos = [];
    partida.turnoActual = 0;
    partida.votos = {};
    partida.eliminados = [];  

    console.log('✅ Partida reseteada, volviendo a sala de espera');

    io.emit('volviendo a sala',{
        jugadores: partida.jugadores,
        estado: partida.estado
    })
}

const nuevaRonda = (io) => {

    // Guardar pistas de la ronda anterior
    partida.pistasAnteriores.push({
        ronda: partida.rondaActual,
        pistas: [...partida.pistas]
    });

    console.log('📝 Pistas guardadas de ronda', partida.rondaActual);

    partida.rondaActual++;
    partida.pistas = [];
    partida.turnoActual = 0;
    partida.votos = {};

    // Actualizar ordenTurnos con los jugadores restantes
    partida.ordenTurnos = partida.jugadores.map(j => ({
        nombre: j.nombre,
        id: j.id
    }));

    partida.estado = 'jugando';

    console.log('🔄 NUEVA RONDA', partida.rondaActual);
    console.log('Jugadores restantes:', partida.jugadores.length);
    console.log('Nuevo orden de turnos:', partida.ordenTurnos);

    io.emit('nueva ronda', {
        turnoActual: partida.ordenTurnos[0],
        rondaActual: partida.rondaActual,
        ordenTurnos: partida.ordenTurnos
    })
}