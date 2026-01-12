// Card suits (standard 4 suits)
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

// Standard ranks 2-10, J, Q, K, A
export type StandardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// Base card interface for standard cards
export interface StandardCard {
  type: 'standard';
  suit: Suit;
  rank: StandardRank;
  value: number; // Numeric value for comparison (2-14 for standard)
}

// Joker card - value is randomized at shuffle time
export interface JokerCard {
  type: 'joker';
  jokerVariant: 'red' | 'black'; // Visual distinction
  value: number; // 0 (lowest) or 15 (highest), set at shuffle time
}

// Union type for all cards
export type Card = StandardCard | JokerCard;

// Player guess
export type Guess = 'higher' | 'lower';

// Game status
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

// Immutable game state
export interface GameState {
  readonly deck: readonly Card[]; // Remaining cards in deck
  readonly currentCard: Card | null; // Currently shown card
  readonly score: number; // Current game score
  readonly bestScore: number; // Persisted best score
  readonly status: GameStatus; // Current game status
  readonly cardsPlayed: number; // Number of cards revealed (including current)
}

// Game result after a guess
export interface GuessResult {
  correct: boolean;
  nextCard: Card;
  newState: GameState;
}
