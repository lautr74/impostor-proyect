import { useState, useEffect } from "react";
import { useSocket } from "../componentes/ContextSocket.jsx";
import { SalaEspera } from '../componentes/SalaEspera.jsx';
import { FasePistas } from '../componentes/FasePistas.jsx';
import { FaseVotacion } from '../componentes/FaseVotacion';
import { JuegoFinalizado } from '../componentes/JuegoFinalizado';
import './GameManager.css';


export function GameManager({ userName }){

    const [miRol, setMiRol] = useState(null)
    const [estado, setEstado] = useState('esperando');
    const [jugadores, setJugadores] = useState([]);
    const [mySocketId, setMySocketId] = useState(null);
    const [fueEliminado, setFueEliminado] = useState(false);

    const { SocketRef, conectado } = useSocket();

     //Actualizar mySocketId cuando cambie la conexión
    useEffect(() => {
        if (conectado && SocketRef.current?.id) {
            setMySocketId(SocketRef.current.id);
            console.log('✅ Socket ID actualizado:', SocketRef.current.id);
        } else {
            setMySocketId(null);
        }
    }, [conectado, SocketRef]);

    //Listeners de Socket.IO
    useEffect(() => {
        if (!SocketRef.current) return

        const socket = SocketRef.current

        const handleSalaActualizada = (data) => {
            console.log('🔄 Sala actualizada:', data);
            setJugadores(data.jugadores);
            setEstado(data.estado);
        };

        const handleRolAsignado = (data) => {
            console.log('🎭 Rol asignado:', data);
            setMiRol(data);
        };

        const handleFasePistas = (data) => {
            console.log('🔍 Fase pistas iniciada:', data);
            setEstado('jugando');
        };

        const handleIniciandoVotacion = (data) => {
            console.log('🗳️ Iniciando votación en GameManager');
            console.log('Data recibida:', data);
            
            if (data && data.jugadores) {
                setJugadores(data.jugadores);
            }
            setEstado('votando');
        };

        const handleJugadorEliminado = (data) => {
            console.log('🚫 Jugador eliminado:', data.jugador, 'con', data.votos, 'votos');
        };

        const handleFuisteEliminado = () => {
            setFueEliminado(true);
        };

        const handleNuevaRonda = (data) => {
            console.log('🔄 NUEVA RONDA:', data.rondaActual);
            
            if (data.ordenTurnos && Array.isArray(data.ordenTurnos)) {
                const jugadoresRestantes = data.ordenTurnos.map(turno => ({
                    id: turno.id,
                    nombre: turno.nombre
                }));
                setJugadores(jugadoresRestantes);
            }
            setEstado('jugando');
        };

        const handleJuegoFinalizado = (data) => {
            console.log('🏆 JUEGO FINALIZADO');
            console.log('   Ganador:', data?.ganador);
            console.log('   Impostor:', data?.impostor);
            
            setEstado('finalizado');
        };

        const handleVolviendoASala = (data) => {
            console.log('🔄 Volviendo a sala:', data);
            setEstado(data.estado);
            setJugadores(data.jugadores);
            setMiRol(null);
        };

        // Agregar todos los listeners
        socket.on('sala actualizada', handleSalaActualizada);
        socket.on('rol asignado', handleRolAsignado);
        socket.on('fase pistas', handleFasePistas);
        socket.on('iniciando votacion', handleIniciandoVotacion);
        socket.on('jugador eliminado', handleJugadorEliminado);
        socket.on('fuiste eliminado', handleFuisteEliminado);
        socket.on('nueva ronda', handleNuevaRonda);
        socket.on('juego finalizado', handleJuegoFinalizado);
        socket.on('volviendo a sala', handleVolviendoASala);

        // Cleanup - remover solo los listeners del juego
        return () => {
            console.log('🎮 Limpiando listeners del GameManager');
            socket.off('sala actualizada', handleSalaActualizada);
            socket.off('rol asignado', handleRolAsignado);
            socket.off('fase pistas', handleFasePistas);
            socket.off('iniciando votacion', handleIniciandoVotacion);
            socket.off('jugador eliminado', handleJugadorEliminado);
            socket.off('fuiste eliminado', handleFuisteEliminado);
            socket.off('nueva ronda', handleNuevaRonda);
            socket.off('juego finalizado', handleJuegoFinalizado);
            socket.off('volviendo a sala', handleVolviendoASala);
        };
    }, [SocketRef]); 

    useEffect(() => {
        if (conectado && SocketRef.current?.id) {
            setMySocketId(SocketRef.current.id);
            console.log('✅ Socket ID actualizado:', SocketRef.current.id);
        }
    }, [conectado, SocketRef]);

    // ✅ ESTADO FINALIZADO - Tiene MÁXIMA PRIORIDAD
    if(estado === 'finalizado'){
        return (
            <div className="game-container">
                <div className="game-content">
                    <JuegoFinalizado 
                        socket={SocketRef.current}
                        miSocketId={mySocketId}
                    />
                </div>
            </div>
        );
    }

    // ✅ El resto de estados solo se renderizan si NO estás eliminado
    if (estado === 'esperando') {
        return (
            <div className="game-container">
                <div className="game-content">
                    <SalaEspera 
                        jugadores={jugadores}
                        userName={userName}
                        socket={SocketRef.current}
                        mySocketId={mySocketId}
                    />
                </div>
            </div>
        );
    }

    if(estado === 'jugando'){
        return (
            <div className="game-container">
                <div className="game-content">
                    <FasePistas 
                        socket={SocketRef.current}
                        miRol={miRol}
                        mySocketId={mySocketId}
                        jugadores={jugadores}
                    />
                </div>
            </div>
        );
    }

    if(estado === 'votando'){
        if (!jugadores || jugadores.length === 0) {
            return (
                <div className="game-container">
                    <div className="game-content">
                        <div style={{ 
                            padding: '20px', 
                            textAlign: 'center',
                            background: '#fff3cd',
                            borderRadius: '10px',
                            margin: '20px'
                        }}>
                            <h2>⚠️ Cargando votación...</h2>
                            <p>Esperando lista de jugadores del servidor</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="game-container">
                <div className="game-content">
                    <FaseVotacion 
                        socket={SocketRef.current}
                        jugadores={jugadores}
                        miSocketId={mySocketId}
                        fueEliminado={fueEliminado}
                    />
                </div>
            </div>
        );
    }

    return(
        <div className="game-container">
            <div className="connecting-state">
                <div className="connecting-message">
                    Conectando al servidor...
                </div>
            </div>
        </div>
    )
}