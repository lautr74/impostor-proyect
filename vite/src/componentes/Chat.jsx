import { useState, useEffect, useRef} from 'react'
import { useSocket } from './ContextSocket';
import './Chat.css'

export function Chat({ userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const { SocketRef, conectado } = useSocket();
  const chatEndRef = useRef(null);
  
  //LISTENERS SOCKET.IO
  useEffect(() => {
    if (!SocketRef.current) return

     const socket = SocketRef.current;

    // Eventos específicos del chat
    const handleMensajesPrevios = (msgs) => {
      setMensajes(msgs);
    };

    const handleChatMessage = (msg) => {
      setMensajes(prev => [...prev, msg]);
      
      
      if (!isOpen && msg.usuario !== userName) {
        setMensajesNoLeidos(prev => prev + 1);
      }
    };

    // Agregar listeners
    socket.on('mensajes previos', handleMensajesPrevios);
    socket.on('chat message', handleChatMessage);

    // Cleanup - remover solo los listeners del chat
    return () => {
      socket.off('mensajes previos', handleMensajesPrevios);
      socket.off('chat message', handleChatMessage);
    };
  }, [userName, isOpen, SocketRef]);



  // Auto-scroll al final del chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensajes]);

  // Resetear contador cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      setMensajesNoLeidos(0);
    }
  }, [isOpen]);

  const enviarMensaje = (e) => {
    e.preventDefault();

    if (mensaje.trim() && conectado) {
      SocketRef.current.emit('chat message', {
        usuario: userName,
        mensaje
      });
      setMensaje('');
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón flotante */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <span className="chat-icon">✕</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            {mensajesNoLeidos > 0 && (
              <span className="chat-badge">{mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}</span>
            )}
          </>
        )}
      </button>

      {/* Ventana del chat */}
      <div className={`chat-widget ${isOpen ? 'open' : ''}`}>
        <div className="chat-widget-header">
          <div className="chat-widget-title">
            <span className="chat-widget-icon">💬</span>
            <h3>Chat en Vivo</h3>
          </div>
          <div className="chat-widget-status">
            <span className={`status-dot ${conectado ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">{conectado ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <button 
            className="chat-widget-close"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="chat-widget-user">
          <span className="user-icon">👤</span>
          <span className="user-name">{userName}</span>
        </div>

        <div className="chat-widget-messages">
          {mensajes.length === 0 ? (
            <div className="chat-empty">
              <p>No hay mensajes aún</p>
              <p className="chat-empty-hint">¡Sé el primero en escribir!</p>
            </div>
          ) : (
            mensajes.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message ${msg.usuario === userName ? 'own' : 'other'}`}
              >
                <div className="message-header">
                  <span className="message-user">{msg.usuario}</span>
                </div>
                <div className="message-bubble">
                  <p className="message-text">{msg.mensaje}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={enviarMensaje} className="chat-widget-input">
          <input
            type="text"
            placeholder={conectado ? 'Escribe un mensaje...' : 'Desconectado...'}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={!conectado}
            className="chat-input-field"
          />
          <button 
            type="submit" 
            disabled={!conectado || !mensaje.trim()} 
            className="chat-send-button"
            aria-label="Send message"
          >
            <span className="send-icon">➤</span>
          </button>
        </form>
      </div>

      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div 
          className="chat-overlay" 
          onClick={toggleChat}
        ></div>
      )}
    </>
  );
}