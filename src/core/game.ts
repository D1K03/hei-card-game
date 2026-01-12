import type { GameState, Guess, GuessResult, GameStatus } from './types.ts';
import { createShuffledDeck } from './deck.ts';
import { compareCards } from './card.ts';

// Total cards in a complete deck
export const TOTAL_CARDS = 54;

// Maximum possible score (played all 54 cards = 53 correct guesses)
export const MAX_SCORE = TOTAL_CARDS - 1; // 53, since first card doesn't count

// Initial state factory
export function createInitialState(bestScore: number = 0): GameState {
  return {
    deck: [],
    currentCard: null,
    score: 0,
    bestScore,
    status: 'idle',
    cardsPlayed: 0,
  };
}

// Start a new game
export function startGame(previousBestScore: number = 0): GameState {
  const deck = createShuffledDeck();
  const firstCard = deck[0];

  if (!firstCard) {
    throw new Error('Failed to create deck');
  }

  return {
    deck: deck.slice(1),
    currentCard: firstCard,
    score: 0,
    bestScore: previousBestScore,
    status: 'playing',
    cardsPlayed: 1,
  };
}

// Process a player's guess
export function makeGuess(state: GameState, guess: Guess): GuessResult {
  if (state.status !== 'playing' || !state.currentCard) {
    throw new Error('Game is not in playing state');
  }

  const nextCard = state.deck[0];

  if (!nextCard) {
    throw new Error('No cards remaining in deck');
  }

  const comparison = compareCards(nextCard, state.currentCard);

  // Determine if guess is correct
  // Equal values: both higher and lower are considered correct (player can't lose on tie)
  let correct: boolean;
  if (comparison === 0) {
    correct = true; // Tie is always correct
  } else if (guess === 'higher') {
    correct = comparison > 0;
  } else {
    correct = comparison < 0;
  }

  const newDeck = state.deck.slice(1);
  const newScore = correct ? state.score + 1 : state.score;
  const newCardsPlayed = state.cardsPlayed + 1;

  // Determine new game status
  let newStatus: GameStatus;
  if (!correct) {
    newStatus = 'lost';
  } else if (newDeck.length === 0) {
    newStatus = 'won'; // All 54 cards played!
  } else {
    newStatus = 'playing';
  }

  // Update best score if needed
  const newBestScore = Math.max(state.bestScore, newScore);

  const newState: GameState = {
    deck: newDeck,
    currentCard: nextCard,
    score: newScore,
    bestScore: newBestScore,
    status: newStatus,
    cardsPlayed: newCardsPlayed,
  };

  return {
    correct,
    nextCard,
    newState,
  };
}

// Get remaining cards count
export function getRemainingCards(state: GameState): number {
  return state.deck.length;
}

// Check if game is over
export function isGameOver(state: GameState): boolean {
  return state.status === 'won' || state.status === 'lost';
}

// Get progress percentage (0-100)
export function getProgress(state: GameState): number {
  return Math.round((state.cardsPlayed / TOTAL_CARDS) * 100);
}
