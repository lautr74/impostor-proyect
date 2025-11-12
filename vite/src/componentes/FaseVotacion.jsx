import { useState, useEffect } from 'react'
import './FaseVotacion.css'

export function FaseVotacion({ socket, jugadores, miSocketId, fueEliminado }) {
    // ========================================
    // ✅ VALIDACIÓN CRÍTICA AL INICIO
    // ========================================
    // Esto previene el error: "can't access property 'length', jugadores is undefined"
    
    if (!jugadores || !Array.isArray(jugadores) || jugadores.length === 0) {
        console.warn('⚠️ FaseVotacion: jugadores no válido', {
            jugadores,
            esArray: Array.isArray(jugadores),
            length: jugadores?.length
        });
        
        return (
            <div className='fase-votacion-container'>
                <h1>🗳️ PREPARANDO VOTACIÓN</h1>
                <p>Esperando lista de jugadores...</p>
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '5px',
                    fontSize: '14px'
                }}>
                    <p>⚠️ <strong>Problema:</strong> No se recibió la lista de jugadores</p>
                    <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                        Debug: jugadores = {JSON.stringify(jugadores)}
                    </p>
                </div>
            </div>
        );
    }

    // ========================================
    // STATE HOOKS
    // ========================================
    const [pistas, setPistas] = useState([]);
    const [votos, setVotos] = useState({});
    const [miVoto, setMiVoto] = useState(null); 
    const [cargando, setCargando] = useState(true);

    // ========================================
    // EFFECT: Setup de listeners
    // ========================================
    useEffect(() => {
        console.log('🗳️ FaseVotacion montado');
        console.log('   Socket ID:', miSocketId);
        console.log('   Jugadores:', jugadores.length);
        console.log('   Jugadores data:', jugadores);
        
        // Solicitar estado inmediatamente
        socket.emit('solicitar estado votacion');
        console.log('📡 Solicitando estado de votación...');

        const handleFaseVotacion = (data) => {
            console.log('✅ Fase votación recibida:', data);
            console.log('   Pistas:', data.pistas?.length || 0);
            console.log('   Jugadores en data:', data.jugadores?.length || 0);
            
            setPistas(data.pistas || []);
            setCargando(false);
        };

        const handleVotosActualizados = (data) => {
            console.log('📊 Votos actualizados:', data);
            setVotos(data || {});
        };

        socket.on('iniciando votacion', handleFaseVotacion); 
        socket.on('votos actualizados', handleVotosActualizados);

        // Timeout de seguridad
        const timeout = setTimeout(() => {
            if (cargando) {
                console.warn('⚠️ Timeout: No se recibió estado en 3 segundos');
                console.warn('   Reintentando...');
                socket.emit('solicitar estado votacion');
            }
        }, 3000);

        return () => {
            console.log('🗳️ FaseVotacion desmontado');
            clearTimeout(timeout);
            socket.off('iniciando votacion', handleFaseVotacion);
            socket.off('votos actualizados', handleVotosActualizados);
        }
    }, [socket, cargando, miSocketId, jugadores])

    // ========================================
    // FUNCIONES
    // ========================================
    const votar = (idJugador) => {
        if (miVoto !== null) {
            console.log('⚠️ Ya votaste');
            return;
        }
        
        console.log('🗳️ Votando por:', idJugador);
        setMiVoto(idJugador);
        socket.emit('votar', idJugador);
    }

    const contarVotos = (idJugador) => {
        if (!votos || typeof votos !== 'object') {
            return 0;
        }
        return Object.values(votos).filter(id => id === idJugador).length;
    }

    // ========================================
    // RENDER: Pantalla de carga
    // ========================================
    if (cargando || !pistas || pistas.length === 0) {
        return (
            <div className='fase-votacion-container'>
                <h1>🗳️ PREPARANDO VOTACIÓN</h1>
                <p>Cargando pistas...</p>
                <div className='loading-spinner'>⏳</div>
                
                <div style={{ marginTop: '20px', fontSize: '12px', opacity: 0.6 }}>
                    <p>Esperando datos del servidor...</p>
                    <p>Socket conectado: {socket?.connected ? '✅' : '❌'}</p>
                    <p>Pistas cargadas: {pistas.length}</p>
                    <p>Jugadores: {jugadores.length}</p>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER: Pantalla principal de votación
    // ========================================
    console.log('🖥️ Renderizando FaseVotacion:', {
        pistasCount: pistas.length,
        votosCount: Object.keys(votos).length,
        jugadoresCount: jugadores.length,
        miVoto
    });

    return (
        <div className='fase-votacion-container'>
            <h1>🗳️ VOTACIONES</h1>
            <p className='instrucciones'>Vota por quien crees que es el impostor</p>
            {fueEliminado && (
                <div style={{
                    background: '#ff6b6b',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    💀 Has sido eliminado - Solo puedes observar
                </div>
            )}
            
            <div className='votos-progreso'>
                <p>Votos: {Object.keys(votos).length} / {jugadores.length}</p>
            </div>

            <div className='jugadores-votacion'>
                {jugadores.map((jugador) => {
                    const pistaJugador = pistas.find(pista => pista.jugadorId === jugador.id);
                    const votosRecibidos = contarVotos(jugador.id);
                    const yoVoteEste = miVoto === jugador.id;
                    const soYo = jugador.id === miSocketId;

                    return (
                        <div 
                            key={jugador.id} 
                            className={`card-votacion ${yoVoteEste ? 'votado' : ''} ${soYo ? 'yo' : ''}`}
                        >
                            <div className='card-header'>
                                <h3>
                                    {jugador.nombre}
                                    {soYo && <span className='badge-yo'> (Tú)</span>}
                                </h3>
                                <div className='votos-count'>
                                    <span className='votos-numero'>{votosRecibidos}</span>
                                    <span className='votos-texto'>votos</span>
                                </div>
                            </div>

                            <div className='card-pista'>
                                <span className='pista-label'>Pista:</span>
                                <span className='pista-contenido'>
                                    "{pistaJugador?.pista || 'Sin pista'}"
                                </span>
                            </div>

                            <button 
                                onClick={() => votar(jugador.id)} 
                                disabled={miVoto !== null || soYo || fueEliminado}                                
                                className={`btn-votar ${yoVoteEste ? 'votado' : ''} ${soYo ? 'disabled' : ''}`}
                            >
                                {soYo ? '👤 Eres tú' : yoVoteEste ? '✓ Votado' : 'Votar'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {miVoto && (
                <div className='mensaje-votado'>
                    ✓ Ya has votado. Esperando a que los demás terminen de votar...
                </div>
            )}
        </div>
    )
}