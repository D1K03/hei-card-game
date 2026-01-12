import type { Card } from './types.ts';
import { SUITS, RANKS, createStandardCard, createJoker } from './card.ts';

// Create a fresh 54-card deck (52 standard + 2 jokers with randomized values)
export function createDeck(): Card[] {
  const cards: Card[] = [];

  // Add 52 standard cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push(createStandardCard(suit, rank));
    }
  }

  // Add 2 jokers with RANDOMIZED high/low values at creation time
  const redJokerIsHigh = Math.random() < 0.5;
  const blackJokerIsHigh = Math.random() < 0.5;

  cards.push(createJoker('red', redJokerIsHigh));
  cards.push(createJoker('black', blackJokerIsHigh));

  return cards;
}

// Fisher-Yates shuffle (immutable - returns new array)
export function shuffleDeck(deck: readonly Card[]): Card[] {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    const swap = shuffled[j];
    if (temp !== undefined && swap !== undefined) {
      shuffled[i] = swap;
      shuffled[j] = temp;
    }
  }

  return shuffled;
}

// Create and shuffle a new deck in one operation
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}
