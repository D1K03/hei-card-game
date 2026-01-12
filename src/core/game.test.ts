import { describe, test, expect } from 'bun:test';
import {
  TOTAL_CARDS,
  MAX_SCORE,
  createInitialState,
  startGame,
  makeGuess,
  getRemainingCards,
  isGameOver,
  getProgress,
} from './game.ts';
import { createStandardCard, createJoker } from './card.ts';
import type { GameState, Card } from './types.ts';

describe('game constants', () => {
  test('TOTAL_CARDS is 54', () => {
    expect(TOTAL_CARDS).toBe(54);
  });

  test('MAX_SCORE is 53 (one less than total cards)', () => {
    expect(MAX_SCORE).toBe(53);
  });
});

describe('createInitialState', () => {
  test('creates idle state with empty deck', () => {
    const state = createInitialState();
    expect(state.status).toBe('idle');
    expect(state.deck).toHaveLength(0);
    expect(state.currentCard).toBeNull();
    expect(state.score).toBe(0);
    expect(state.cardsPlayed).toBe(0);
  });

  test('accepts initial best score', () => {
    const state = createInitialState(25);
    expect(state.bestScore).toBe(25);
  });

  test('defaults best score to 0', () => {
    const state = createInitialState();
    expect(state.bestScore).toBe(0);
  });
});

describe('startGame', () => {
  test('sets status to playing', () => {
    const state = startGame();
    expect(state.status).toBe('playing');
  });

  test('draws first card from deck', () => {
    const state = startGame();
    expect(state.currentCard).not.toBeNull();
    expect(state.cardsPlayed).toBe(1);
  });

  test('deck has 53 remaining cards', () => {
    const state = startGame();
    expect(state.deck).toHaveLength(53);
  });

  test('preserves best score', () => {
    const state = startGame(42);
    expect(state.bestScore).toBe(42);
  });

  test('resets score to 0', () => {
    const state = startGame(10);
    expect(state.score).toBe(0);
  });
});

describe('makeGuess', () => {
  // Helper to create a controlled game state for testing
  function createTestState(currentCard: Card, nextCards: Card[], score = 0, bestScore = 0): GameState {
    return {
      deck: nextCards,
      currentCard,
      score,
      bestScore,
      status: 'playing',
      cardsPlayed: 1,
    };
  }

  describe('correct guesses', () => {
    test('higher guess is correct when next card is higher', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.correct).toBe(true);
      expect(result.newState.score).toBe(1);
    });

    test('lower guess is correct when next card is lower', () => {
      const current = createStandardCard('hearts', 'K');
      const next = createStandardCard('spades', '3');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'lower');

      expect(result.correct).toBe(true);
      expect(result.newState.score).toBe(1);
    });

    test('score increments on correct guess', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next], 5);

      const result = makeGuess(state, 'higher');

      expect(result.newState.score).toBe(6);
    });
  });

  describe('incorrect guesses', () => {
    test('higher guess is wrong when next card is lower', () => {
      const current = createStandardCard('hearts', 'K');
      const next = createStandardCard('spades', '3');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.correct).toBe(false);
      expect(result.newState.status).toBe('lost');
    });

    test('lower guess is wrong when next card is higher', () => {
      const current = createStandardCard('hearts', '2');
      const next = createStandardCard('spades', 'A');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'lower');

      expect(result.correct).toBe(false);
      expect(result.newState.status).toBe('lost');
    });

    test('score does not increment on wrong guess', () => {
      const current = createStandardCard('hearts', 'K');
      const next = createStandardCard('spades', '3');
      const state = createTestState(current, [next], 5);

      const result = makeGuess(state, 'higher');

      expect(result.newState.score).toBe(5);
    });
  });

  describe('tie handling', () => {
    test('higher guess is correct on tie', () => {
      const current = createStandardCard('hearts', '7');
      const next = createStandardCard('spades', '7');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.correct).toBe(true);
    });

    test('lower guess is correct on tie', () => {
      const current = createStandardCard('hearts', '7');
      const next = createStandardCard('spades', '7');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'lower');

      expect(result.correct).toBe(true);
    });
  });

  describe('joker interactions', () => {
    test('high joker beats ace with higher guess', () => {
      const current = createStandardCard('spades', 'A');
      const next = createJoker('red', true);
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.correct).toBe(true);
    });

    test('low joker loses to two with lower guess', () => {
      const current = createStandardCard('hearts', '2');
      const next = createJoker('black', false);
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'lower');

      expect(result.correct).toBe(true);
    });
  });

  describe('state transitions', () => {
    test('current card becomes the revealed card', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.newState.currentCard).toEqual(next);
    });

    test('deck shrinks by one', () => {
      const current = createStandardCard('hearts', '5');
      const cards = [
        createStandardCard('spades', '10'),
        createStandardCard('clubs', 'J'),
        createStandardCard('diamonds', 'Q'),
      ];
      const state = createTestState(current, cards);

      const result = makeGuess(state, 'higher');

      expect(result.newState.deck).toHaveLength(2);
    });

    test('cardsPlayed increments', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next]);

      const result = makeGuess(state, 'higher');

      expect(result.newState.cardsPlayed).toBe(2);
    });
  });

  describe('best score tracking', () => {
    test('updates best score when current score exceeds it', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next], 10, 10);

      const result = makeGuess(state, 'higher');

      expect(result.newState.bestScore).toBe(11);
    });

    test('preserves best score when current score is lower', () => {
      const current = createStandardCard('hearts', '5');
      const next = createStandardCard('spades', '10');
      const state = createTestState(current, [next], 5, 20);

      const result = makeGuess(state, 'higher');

      expect(result.newState.bestScore).toBe(20);
    });
  });

  describe('win condition', () => {
    test('status becomes won when deck is empty after correct guess', () => {
      const current = createStandardCard('hearts', '5');
      const lastCard = createStandardCard('spades', '10');
      const state = createTestState(current, [lastCard], 52); // 52 correct so far

      const result = makeGuess(state, 'higher');

      expect(result.correct).toBe(true);
      expect(result.newState.status).toBe('won');
      expect(result.newState.score).toBe(53); // MAX_SCORE
    });
  });

  describe('error handling', () => {
    test('throws when game is not playing', () => {
      const state = createInitialState();

      expect(() => makeGuess(state, 'higher')).toThrow('Game is not in playing state');
    });

    test('throws when no cards remain', () => {
      const state: GameState = {
        deck: [],
        currentCard: createStandardCard('hearts', '5'),
        score: 0,
        bestScore: 0,
        status: 'playing',
        cardsPlayed: 54,
      };

      expect(() => makeGuess(state, 'higher')).toThrow('No cards remaining in deck');
    });
  });
});

describe('helper functions', () => {
  describe('getRemainingCards', () => {
    test('returns deck length', () => {
      const state = startGame();
      expect(getRemainingCards(state)).toBe(53);
    });
  });

  describe('isGameOver', () => {
    test('returns false for idle state', () => {
      const state = createInitialState();
      expect(isGameOver(state)).toBe(false);
    });

    test('returns false for playing state', () => {
      const state = startGame();
      expect(isGameOver(state)).toBe(false);
    });

    test('returns true for won state', () => {
      const state: GameState = { ...startGame(), status: 'won' };
      expect(isGameOver(state)).toBe(true);
    });

    test('returns true for lost state', () => {
      const state: GameState = { ...startGame(), status: 'lost' };
      expect(isGameOver(state)).toBe(true);
    });
  });

  describe('getProgress', () => {
    test('returns 0 for idle state', () => {
      const state = createInitialState();
      expect(getProgress(state)).toBe(0);
    });

    test('returns approximately 2% after first card', () => {
      const state = startGame();
      expect(getProgress(state)).toBe(2); // 1/54 ≈ 1.85% → rounds to 2%
    });

    test('returns 100% when all cards played', () => {
      const state: GameState = {
        ...startGame(),
        cardsPlayed: 54,
      };
      expect(getProgress(state)).toBe(100);
    });
  });
});
