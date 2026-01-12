import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth } from "./pages/Auth.jsx"
import { Navbar } from './componentes/Navbar.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { GameManager } from './pages/GameManager.jsx'
import { Chat } from './componentes/Chat.jsx'
import { SocketProvider } from './componentes/ContextSocket.jsx'
import { Offline } from './pages/Offline.jsx'
import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { API_URL } from './config';
import "./App.css"


const ProtectedRoute = ({ isAuthenticated, children }) => {
         if (!isAuthenticated) { 
             return <Navigate to="/auth" replace />; 
           }
      return children;
}


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const verificarSesion = async () => {
          try {
              const res = await fetch( `${API_URL}/verificar-sesion`, {
                  credentials: 'include' 
              });
              const data = await res.json();
                
              if (data.autenticado) {
                  setIsAuthenticated(true);
                  setUserName(data.userName || ''); 
              }
          } catch (error) {
              console.error('Error verificando sesión:', error);
          } finally {
              setLoading(false);
          }
               };

        verificarSesion();
    }, []);

   
if (loading) return <div style={{color: 'white'}}>Cargando partida...</div>;

return(
  <BrowserRouter>
    <Navbar isAuthenticated={isAuthenticated} userName={userName}/>
    <Toaster position="top-right" richColors />
    
    
    {isAuthenticated ? (
      <SocketProvider>
        <Chat userName={userName} />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/auth' element={<Navigate to="/" replace />} />
          <Route path='/impostor' element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <GameManager userName={userName} />
            </ProtectedRoute>
          }/>
        </Routes>
      </SocketProvider>
    ) : (
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/offline' element={<Offline />} />
        <Route path='/auth' element={
          <Auth 
            setUserName={setUserName}
            setIsAuthenticated={setIsAuthenticated} 
          />
        }/>
        <Route path='*' element={<Navigate to="/auth" replace />} />
      </Routes>
    )}
  </BrowserRouter>
)
      
}

createRoot(document.getElementById('root')).render(
    <App />
)