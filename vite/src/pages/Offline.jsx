import React, {useState} from "react";
import "./Offline.css";
import SetupPlayers from "../componentes/SetupPlayers";
import SetupNames from "../componentes/SetupNames";
import GameScreen from "../componentes/GameScreen";
import { FOOTBALL_PLAYERS } from "../data";

export const Offline = () => {
    const [step, setStep] = useState(1);
    const [numPlayers, setNumPlayers] = useState(3);
    const [playerNames, setPlayerNames] = useState([]);
    const [impostorIndex, setImpostorIndex] = useState(null);
    const [secretWord, setSecretWord] = useState("");

    const handleSiguiente = (quantity) => {
        setNumPlayers(quantity);
        setStep(2);
    }
    
    const StartGame = (names) => {
        setImpostorIndex(Math.floor(Math.random() * names.length));
        setSecretWord(FOOTBALL_PLAYERS[Math.floor(Math.random() * FOOTBALL_PLAYERS.length)]);
        setPlayerNames(names);
        setStep(3);
    }

    return (
        <div className="offline-container">
            <h1>🕵️ El Impostor</h1>
            {step === 1 && <SetupPlayers handleSiguiente={handleSiguiente} />}
            {step === 2 && <SetupNames quantity={numPlayers} StartGame={StartGame} />}
            {step === 3 && (
                <GameScreen 
                    playerNames={playerNames} 
                    secretWord={secretWord} 
                    impostorIndex={impostorIndex} 
                />
                
            )}
        </div>
    );
}
export default Offline;