import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config.js';


export function Auth({ setIsAuthenticated, setUserName }) {

  const [registrado, setRegistrado] = useState(true);
  const navigate = useNavigate();;

  // función que se ejecuta al enviar el formulario
  const handleSubmitRegister = async (e) => {
    e.preventDefault(); 
    console.log('enviando peticion')
  
    const form = e.target; 
    const datos = {
      usuario: form.usuario.value,
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await fetch(`${API_URL}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.mensaje);
        setIsAuthenticated(true);
        setUserName(data.usuario.usuario);
        navigate("/")
      } else {
        toast.error(data.mensaje);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }  
  };


  const handleSubmitSession = async (e) => {
    e.preventDefault();

    const form = e.target;
    const datos = {
      usuario: form.usuario.value,
      password: form.password.value,
    };

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
        credentials: 'include'
      })
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.mensaje);
        setIsAuthenticated(true);
        setUserName(data.usuario.usuario)
        navigate("/")
      } else {
        toast.error(data.mensaje);
      }
    } catch (error) {
      toast.error('Error de conexión');
    }       
  };

  return (
    <div className="auth-container">
    <div className="button-container">
      <button onClick={() => setRegistrado(false)} className={registrado === false ? "active" : ""}>Registro</button>
      <button onClick={() => setRegistrado(true)} className={registrado === true ? "active" : ""} >Inicio Sesion</button>
    </div>
    { !registrado ? (
    <form onSubmit={handleSubmitRegister}>
      <label htmlFor='usuario'>Usuario</label>
      <input 
        id='usuario' 
        name="usuario" 
        placeholder="Elige tu nombre de usuario" 
        required
      />
      
      <label htmlFor='email'>Email</label>
      <input 
        id="email" 
        name="email" 
        type="email"
        placeholder="tu@email.com" 
        required
      />
      
      <label htmlFor='password'>Contraseña</label>
      <input 
        id='password' 
        name="password" 
        type="password" 
        placeholder="Mínimo 6 caracteres"
        minLength="6"
        required
      />
      
      <button type="submit">Crear cuenta</button>
    </form>
   ) : 
   (
    <form onSubmit={handleSubmitSession}>
      <label htmlFor='usuario'>Usuario</label>
      <input 
        id='usuario' 
        name="usuario" 
        placeholder="Tu nombre de usuario" 
        required
      />
      
      <label htmlFor='password'>Contraseña</label>
      <input 
        id='password' 
        name="password" 
        type="password" 
        placeholder="Tu contraseña"
        required
      />
      
      <button type="submit">Iniciar Sesión</button>
    </form>
  )}
  </div>
 )
}