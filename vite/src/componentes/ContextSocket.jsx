import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }){
    const SocketRef = useRef(null);
    const [conectado, setConectado] = useState(false);

    useEffect(() => {

         SocketRef.current = io('http://localhost:3000', {
            withCredentials: true
        });

        const socket = SocketRef.current;

        socket.on('connect', () => {
            console.log('🔌 Socket conectado');
            setConectado(true);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket desconectado');

        })
    }, []);

    return(
        <SocketContext.Provider value={{ SocketRef, conectado }}>
            {children}
        </SocketContext.Provider>
    )
};


export function useSocket(){
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket debe ser usado dentro de un SocketProvider");
    }
    return context;
}