// ...existing code...
import { useState, useEffect } from 'react';
import './JuegoFinalizado.css';

export function JuegoFinalizado({ socket, miSocketId }) {
  const [resultado, setResultado] = useState(null);
  const [segundosRestantes, setSegundosRestantes] = useState(60);

  useEffect(() => {

    socket.emit('solicitar estado finalizado');
    console.log('📡 Solicitando estado finalizado...');

    socket.on('juego finalizado', (data) => {
      setResultado(data);
      setSegundosRestantes(60); 
    });      1

    socket.on('volviendo a sala', (data) => {
      setResultado(null);
      setSegundosRestantes(60);
    });

    return () => {
      socket.off('juego finalizado');
      socket.off('volviendo a sala');
    };
  }, [socket]);2

  // Cuenta regresiva visual (60s hasta que el backend reinicie la partida)
  useEffect(() => {
    if (!resultado) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((s) => {
        if (s <= 1) {
          clearInterval(intervalo);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [resultado]);

  if (!resultado) {
    return <div className="cargando">Cargando resultado...</div>;
  }

  const ganadores = resultado.ganador;
  const ganaronJugadores = ganadores === 'jugadores';

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const formatoTiempo = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

  return (
    <div className="juego-finalizado-container">
      {/* Resultado principal */}
      <div className={`resultado-card ${ganaronJugadores ? 'victoria-jugadores' : 'victoria-impostor'}`}>
        {ganaronJugadores ? (
          <>
            <h1 className="resultado-titulo">🎉 ¡VICTORIA!</h1>
            <p className="resultado-subtitulo">El impostor ha sido descubierto</p>
            <p className="resultado-texto">¡Eliminaron al impostor!</p>
          </>
        ) : (
          <>
            <h1 className="resultado-titulo">😈 ¡EL IMPOSTOR GANÓ!</h1>
            <p className="resultado-subtitulo">El impostor sobrevivió</p>
            <p className="resultado-texto">¡Engañó a todos!</p>
          </>
        )}
      </div>

      {/* Revelaciones */}
      <div className="revelaciones">
        <div className="revelacion-item">
          <span className="revelacion-label">🎭 El impostor era:</span>
          <span className="revelacion-valor">{resultado.impostor}</span>
        </div>
        <div className="revelacion-item">
          <span className="revelacion-label">🎯 La palabra secreta:</span>
          <span className="revelacion-valor">{resultado.palabraSecreta}</span>
        </div>
      </div>

      {/* Información de reinicio automático */}
      <div className="nuevo-juego-section">
        <div className="info-reinicio">
          <p>La próxima partida comenzará automáticamente en:</p>
          <div className="countdown">{formatoTiempo}</div>
          <p className="nota">No es necesario hacer nada — volviendo a la sala de espera cuando finalice el temporizador.</p>
        </div>
      </div>
    </div>
  );
}