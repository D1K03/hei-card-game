import type { Card, StandardCard, JokerCard, Suit, StandardRank } from './types.ts';

// Rank to numeric value mapping
const RANK_VALUES: Record<StandardRank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

// All suits in order
export const SUITS: readonly Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'] as const;

// All ranks in order
export const RANKS: readonly StandardRank[] = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A',
] as const;

// Suit symbols for display
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

// Create a standard card
export function createStandardCard(suit: Suit, rank: StandardRank): StandardCard {
  return {
    type: 'standard',
    suit,
    rank,
    value: RANK_VALUES[rank],
  };
}

// Create a joker card (value set at creation based on isHigh)
export function createJoker(variant: 'red' | 'black', isHigh: boolean): JokerCard {
  return {
    type: 'joker',
    jokerVariant: variant,
    value: isHigh ? 15 : 0, // 15 = highest, 0 = lowest
  };
}

// Compare two cards: returns positive if a > b, negative if a < b, 0 if equal
export function compareCards(a: Card, b: Card): number {
  return a.value - b.value;
}

// Get display string for a card
export function getCardDisplay(card: Card): string {
  if (card.type === 'joker') {
    const position = card.value === 15 ? 'HIGH' : 'LOW';
    return `Joker [${position}]`;
  }
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

// Type guard for joker
export function isJoker(card: Card): card is JokerCard {
  return card.type === 'joker';
}

// Get card color (for styling)
export function getCardColor(card: Card): 'red' | 'black' {
  if (card.type === 'joker') {
    return card.jokerVariant;
  }
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
}

// Get suit symbol
export function getSuitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit];
}
