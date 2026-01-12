import{ useState } from 'react';

export default function GameScreen({ playerNames, secretWord, impostorIndex }){
   
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const handleNext = () => {
        if (currentPlayer < playerNames.length - 1) {
            setCurrentPlayer(currentPlayer + 1);
            setIsRevealed(false);
        } else {
            setGameStarted(true);
        }
    };

    // Si todos ya vieron su rol, mostramos la pantalla de debate
    if (gameStarted) {
        return (
            <div style={{ textAlign: 'center' }}>
                <h2>¡A discutir! 🗣️</h2>
                <p>Todos conocen su rol. El impostor debe intentar pasar desapercibido.</p>
                <button onClick={() => window.location.reload()}>
                    Nueva Partida
                </button>
            </div>
        );
    }

    return (
        <div >
            <h3>Turno de:</h3>
            <h2>{playerNames[currentPlayer]}</h2>

            <div>
                {isRevealed ? (
                    <div>
                        {currentPlayer === impostorIndex ? (
                            <h2>🕵️ Eres el IMPOSTOR</h2>
                        ) : (
                            <>
                                <p>La palabra secreta es:</p>
                                <h2>{secretWord}</h2>
                            </>
                        )}
                        <p>
                            (Asegúrate de que nadie más esté mirando)
                        </p>
                    </div>
                ) : (
                    <p>Pulsa el botón para revelar tu rol</p>
                )}
            </div>

            {!isRevealed ? (
                <button onClick={() => setIsRevealed(true)}>
                    REVELAR
                </button>
            ) : (
                <button onClick={handleNext}>
                    ENTENDIDO, SIGUIENTE
                </button>
            )}
        </div>
    );
};
