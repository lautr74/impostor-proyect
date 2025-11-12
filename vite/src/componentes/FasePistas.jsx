import { useEffect, useState } from 'react';
import './FasePistas.css';

export function FasePistas({ socket, miRol, mySocketId, jugadores }) {

    const [pistas, setPistas] = useState([]);
    const [ordenTurnos, setOrdenTurnos] = useState([]);
    const [turnoActual, setTurnoActual] = useState(null);
    const [miPista, setMiPista] = useState("");

    useEffect(() => {
        console.log('🔌 FasePistas montado, registrando listeners...');
        console.log('Socket ID:', mySocketId);
        console.log('Mi rol:', miRol);

  
        socket.emit('solicitar estado fase');

        // Handler para fase pistas
        const handleFasePistas = (data) => {
            console.log('✅ 🎮 Fase pistas recibida:', data);
            setOrdenTurnos(data.ordenTurnos);
            setTurnoActual(data.turnoActual);
        };

        // Handler para nueva pista
        const handleNuevaPista = (pista) => {
            console.log('📝 Nueva pista recibida:', pista);
            setPistas(prev => [...prev, pista]);
        };

        // Handler para nuevo turno
        const handleNuevoTurno = (data) => {
            console.log('➡️ Nuevo turno:', data.nuevoTurno);
            setTurnoActual(data.nuevoTurno);
        };

        // Registrar listeners
        socket.on('fase pistas', handleFasePistas);
        socket.on('nueva pista', handleNuevaPista);
        socket.on('nuevo turno', handleNuevoTurno);

        // Cleanup
        return () => {
            console.log('🔌 FasePistas desmontado, limpiando listeners...');
            socket.off('fase pistas', handleFasePistas);
            socket.off('nueva pista', handleNuevaPista);
            socket.off('nuevo turno', handleNuevoTurno);
        };
    }, [socket, mySocketId, miRol]); // ✅ Incluir todas las dependencias

    const enviarPista = (e) => {
        e.preventDefault();
        
        if (miPista.trim()) {
            console.log('📤 Enviando pista:', miPista);
            socket.emit('enviar pista', miPista);
            setMiPista('');
        }
    };

    // Verificar si es mi turno
    const esMiTurno = turnoActual?.id === mySocketId;

    console.log('📊 Estado actual:', {
        turnoActual,
        mySocketId,
        esMiTurno,
        pistasCount: pistas.length,
        ordenTurnosLength: ordenTurnos.length
    });

    // ✅ MEJORADO: Mostrar estado de carga
    if (!ordenTurnos.length || !turnoActual) {
        return (
            <div className="fase-pistas-container">
                <div className="cargando">
                    <h2>⏳ Preparando fase de pistas...</h2>
                    <p>Esperando información del servidor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fase-pistas-container">
            {/* Card con tu rol */}
            <div className="rol-card">
                {miRol?.esImpostor ? (
                    <>
                        <h2>🎭 ERES EL IMPOSTOR</h2>
                        <p>Categoría: {miRol.categoria}</p>
                        <p className="advertencia">¡No sabes la palabra! Intenta adivinarla por las pistas</p>
                    </>
                ) : (
                    <>
                        <h2>🎯 TU PALABRA</h2>
                        <p className="palabra-secreta">{miRol?.palabraSecreta}</p>
                        <p>Categoría: {miRol?.categoria}</p>
                    </>
                )}
            </div>

            {/* Lista de pistas */}
            <div className="pistas-lista">
                <h3>💬 Pistas dadas ({pistas.length}/{ordenTurnos.length}):</h3>
                {pistas.length === 0 ? (
                    <p className="sin-pistas">Aún no hay pistas...</p>
                ) : (
                    pistas.map((pista, index) => (
                        <div key={index} className="pista-item">
                            <span className="pista-jugador">{pista.jugadorNombre}:</span>
                            <span className="pista-texto">"{pista.pista}"</span>
                        </div>
                    ))
                )}
            </div>

            {/* Input para enviar pista */}
            {esMiTurno ? (
                <form onSubmit={enviarPista} className="pista-form">
                    <h3>✨ ¡Es tu turno!</h3>
                    <input
                        type="text"
                        value={miPista}
                        onChange={(e) => setMiPista(e.target.value)}
                        placeholder="Escribe tu pista aquí..."
                        maxLength={50}
                        autoFocus
                    />
                    <button type="submit" disabled={!miPista.trim()}>
                        Enviar Pista
                    </button>
                </form>
            ) : (
                <div className="esperando-turno">
                    <p>⏳ Esperando a <strong>{turnoActual?.nombre}</strong></p>
                    <p className="turno-info">Turno {pistas.length + 1} de {ordenTurnos.length}</p>
                </div>
            )}
        </div>
    );
}