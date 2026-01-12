import { TOTAL_CARDS, getProgress, type GameState } from '../../../core/index.ts';

interface ScoreDisplayProps {
  state: GameState;
}

export function ScoreDisplay({ state }: ScoreDisplayProps) {
  const progress = state.status !== 'idle' ? getProgress(state) : 0;

  return (
    <div className="score-display">
      <div className="score-items">
        <div className="score-item">
          <span className="score-label">Score</span>
          <span className="score-value current">{state.score}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Best</span>
          <span className="score-value best">{state.bestScore}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Cards</span>
          <span className="score-value cards">
            {state.cardsPlayed}/{TOTAL_CARDS}
          </span>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
