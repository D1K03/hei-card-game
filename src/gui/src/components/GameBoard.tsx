import { Card } from './Card.tsx';
import { ScoreDisplay } from './ScoreDisplay.tsx';
import type { GameState, Guess, GuessResult } from '../../../core/index.ts';
import { MAX_SCORE } from '../../../core/index.ts';

interface GameBoardProps {
  state: GameState;
  lastResult: GuessResult | null;
  isRevealing: boolean;
  onGuess: (guess: Guess) => void;
  onRestart: () => void;
}

export function GameBoard({ state, lastResult, isRevealing, onGuess, onRestart }: GameBoardProps) {
  const isPlaying = state.status === 'playing';
  const isGameOver = state.status === 'won' || state.status === 'lost';

  // Determine card highlight during reveal
  const cardHighlight =
    isRevealing && lastResult ? (lastResult.correct ? 'correct' : 'wrong') : null;

  return (
    <div className="game-board">
      <ScoreDisplay state={state} />

      <div className="card-area">
        <Card card={state.currentCard} highlight={cardHighlight} />
      </div>

      {isPlaying && !isRevealing && (
        <div className="controls">
          <button className="btn btn-higher" onClick={() => onGuess('higher')}>
            Higher
          </button>
          <button className="btn btn-lower" onClick={() => onGuess('lower')}>
            Lower
          </button>
        </div>
      )}

      {isRevealing && lastResult && (
        <div className={`result-message ${lastResult.correct ? 'correct' : 'wrong'}`}>
          {lastResult.correct ? 'Correct!' : 'Wrong!'}
        </div>
      )}

      {isGameOver && (
        <div className="game-over">
          <h2 className={state.status === 'won' ? 'win' : 'lose'}>
            {state.status === 'won' ? 'You Won!' : 'Game Over'}
          </h2>
          <p className="final-score">
            Final Score: <strong>{state.score}</strong> / {MAX_SCORE}
          </p>
          {state.score === state.bestScore && state.score > 0 && (
            <p className="new-best">New Best Score!</p>
          )}
          <button className="btn btn-restart" onClick={onRestart}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
