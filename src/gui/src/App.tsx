import { useGame } from './hooks/useGame.ts';
import { GameBoard } from './components/GameBoard.tsx';
import './App.css';

function App() {
  const { state, lastResult, start, guess, isRevealing } = useGame();

  if (state.status === 'idle') {
    return (
      <div className="app">
        <div className="welcome">
          <h1>Higher or Lower</h1>
          <p>
            Guess whether the next card will be higher or lower than the current card.
          </p>
          <p className="rules">
            Complete all 54 cards to win!
            <br />
            Jokers can be either the highest or lowest card.
          </p>
          <button className="btn btn-start" onClick={start}>
            Start Game
          </button>
          {state.bestScore > 0 && (
            <p className="best-score">
              Your best score: <strong>{state.bestScore}</strong>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Higher or Lower</h1>
      <GameBoard
        state={state}
        lastResult={lastResult}
        isRevealing={isRevealing}
        onGuess={guess}
        onRestart={start}
      />
    </div>
  );
}

export default App;
