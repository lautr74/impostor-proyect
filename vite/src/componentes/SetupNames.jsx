import React, { useState } from 'react';

const SetupNames = ({ quantity, StartGame }) => {
    const [names, setNames] = useState(Array(quantity).fill(''));

    const handleChange = (index, value) => {
        const updatedNames = [...names];
        updatedNames[index] = value;
        setNames(updatedNames);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        StartGame(names);
    }
    return (
        <form onSubmit={handleSubmit}>
            <h3>Escribe los nombres:</h3>
            {names.map((name, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder={`Jugador ${i + 1}`}
                        value={name}
                        onChange={(e) => handleChange(i, e.target.value)}
                        required
                    />
                </div>
            ))}
            <button type="submit">Generar Roles</button>
        </form>
    );

} 
export default SetupNames;