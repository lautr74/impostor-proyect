import React, { useState } from 'react';

const SetupPlayers = ({ handleSiguiente }) => {

    const [numPlayers, setNumPlayers] = useState(3);

    const handleNumber = (e) => {
        setNumPlayers(Number(e.target.value));
    }

    return (
        <div>
            <h2>Selecciona el número de jugadores:</h2>
            <input type='number' min={1} value={numPlayers} onChange={handleNumber}/>
            <button onClick={() => handleSiguiente(numPlayers)}>Siguiente</button>
        </div>
    );
}

export default SetupPlayers;