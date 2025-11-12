import { useState,useEffect } from 'react';
import './SalaEspera.css';

export function SalaEspera({ mySocketId, socket }){

    const [miCategoria, setMiCategoria] = useState(null);
    const [jugadores , setJugadores] = useState([]);

    
    useEffect(() => {
        if (!socket) return;

        console.log('🎮 SalaEspera: Registrando listener "sala actualizada"');

        const handleSalaActualizada = (data) => {
            console.log('🔄 [SalaEspera] Sala actualizada recibida:', data);
            setJugadores(data.jugadores);
        };

        socket.on('sala actualizada', handleSalaActualizada);

        // Solicitar estado actual al montar
        console.log('📡 [SalaEspera] Solicitando estado de sala...');
        socket.emit('solicitar estado sala');

        return () => {
            console.log('🧹 [SalaEspera] Limpiando listener');
            socket.off('sala actualizada', handleSalaActualizada);
        };
    }, [socket]);

    const myPlayer = jugadores.find(j => j.id === mySocketId);

    const votar = (categoria) => {
        setMiCategoria(categoria);
        socket.emit('votar categoria', categoria)
    }

    const listo = () => {
        socket.emit('marcar listo')
    };

    return (
        <div className='sala-espera'>
            <h1>🎮 Sala de Espera</h1>
            <p>Jugadores: {jugadores.length }</p>

            <div className='jugadores-lista'>
                {jugadores.map(j => (
                    <div key={j.id} className={j.id === mySocketId ? 'mi-jugador' : ''}>
                        <span>{j.nombre}</span>
                        <span>{j.listo ? '✅ Listo' : '⏳ Esperando'}</span>
                        <span>
                            {j.categoria === 'futbolistas' && '⚽'}
                            {j.categoria === 'objetos' && '📦'}
                        </span>
                    </div>
                ))}
            </div>
            
            {!myPlayer?.listo && (
                <div className='categoria-botones'>
                    <button onClick={() => votar('futbolistas')} disabled={miCategoria !== null} >
                        ⚽ Futbolistas
                    </button>
                    <button onClick={() => votar('objetos')} disabled={miCategoria !== null} >
                        📦 Random
                    </button>
                </div>
            )}


            {miCategoria && !myPlayer?.listo && (
                <button onClick={listo} className="btn-listo">
                    ¡Estoy Listo!
                </button>
            )}

        </div>
    )

}