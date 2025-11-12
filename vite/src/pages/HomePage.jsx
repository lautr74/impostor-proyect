import { NavLink } from "react-router-dom";
import './HomePage.css'

export function HomePage(){
    return(
        <div className="home-page">
            <section className="hero">
                <h1>Bienvenido a GameSpot</h1>
                <h2>El mejor lugar para jugar con tus amigos</h2>
                <h2>Espero que te diviertas y disfrutes</h2>
                <NavLink to="/auth" className="cta-button">Logueate para poder jugar</NavLink>
            </section>
            <section className="games">
         <div className="game-card">
            <h1>El impostor ha de ser descubierto</h1>
            <span>En este juego deberas descubrir quien de tus amigos esta mintiendo,hazlo antes de que gane!!!
            </span>
            <NavLink to="/impostor">Impostor</NavLink>
         </div>
         <div className="game-card">
            <h1>Juego de cartas EL Clavito</h1>
            <span>
               Mitico juego de cartas, en el que solo uno saldra vencedor, apuntate a una partida!!
            </span>
            <NavLink to="/clavito">Clavito</NavLink>
         </div>
        </section>
        </div>
    )
}