import { useState, useCallback, useEffect } from 'react';
import {
  startGame,
  makeGuess,
  createInitialState,
  type GameState,
  type Guess,
  type GuessResult,
} from '../../../core/index.ts';

const BEST_SCORE_KEY = 'higherLower_bestScore';

interface UseGameReturn {
  state: GameState;
  lastResult: GuessResult | null;
  start: () => void;
  guess: (g: Guess) => void;
  isRevealing: boolean;
}

export function useGame(): UseGameReturn {
  // Load best score from localStorage
  const loadBestScore = (): number => {
    try {
      const saved = localStorage.getItem(BEST_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  };

  const [state, setState] = useState<GameState>(() => createInitialState(loadBestScore()));
  const [lastResult, setLastResult] = useState<GuessResult | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  // Persist best score
  useEffect(() => {
    try {
      localStorage.setItem(BEST_SCORE_KEY, state.bestScore.toString());
    } catch {
      // Ignore localStorage errors
    }
  }, [state.bestScore]);

  const start = useCallback(() => {
    setLastResult(null);
    setState(startGame(state.bestScore));
  }, [state.bestScore]);

  const guess = useCallback(
    (g: Guess) => {
      if (state.status !== 'playing' || isRevealing) return;

      const result = makeGuess(state, g);
      setLastResult(result);
      setIsRevealing(true);

      // Brief delay for card reveal animation
      setTimeout(() => {
        setState(result.newState);
        setIsRevealing(false);
      }, 800);
    },
    [state, isRevealing]
  );

  return { state, lastResult, start, guess, isRevealing };
}
