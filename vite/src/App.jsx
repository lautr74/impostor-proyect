import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth } from "./pages/Auth.jsx"
import { Navbar } from './componentes/Navbar.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { GameManager } from './pages/GameManager.jsx'
import { Chat } from './componentes/Chat.jsx'
import { SocketProvider } from './componentes/ContextSocket.jsx'
import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import "./App.css"

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [userName, setUserName] = useState('');

    const ProtectedRoute = ({ children }) => {
        if (!isAuthenticated) { 
              return <Navigate to="/auth" replace />; 
        }
        return children;
    }

return(
  <BrowserRouter>
    <Navbar isAuthenticated={isAuthenticated} userName={userName}/>
    <Toaster position="top-right" richColors />
    
    {/* Un solo SocketProvider envolviendo todo lo que lo necesita */}
    {isAuthenticated ? (
      <SocketProvider>
        <Chat userName={userName} />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/auth' element={<Navigate to="/" replace />} />
          <Route path='/impostor' element={
            <ProtectedRoute>
              <GameManager userName={userName} />
            </ProtectedRoute>
          }/>
        </Routes>
      </SocketProvider>
    ) : (
      <Routes>
        <Route path='/' element={<HomePage />} />
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