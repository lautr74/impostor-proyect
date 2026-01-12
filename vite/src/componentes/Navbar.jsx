import { NavLink } from "react-router-dom";
import './Navbar.css'

export function Navbar({ isAuthenticated, userName }) {
  return (
  <nav>
    <NavLink to="/">Home</NavLink>
    <NavLink to="/clavito">Clavito</NavLink>
    <NavLink to="/impostor">Impostor</NavLink>
    <NavLink to="/offline">Offline</NavLink>
    {isAuthenticated ? (
      <span>{userName}</span>
    ) : (
      <NavLink to="/auth">Login/Registro</NavLink>
    )}
  </nav>
);
}