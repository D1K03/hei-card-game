import { describe, test, expect } from 'bun:test';
import { createDeck, shuffleDeck, createShuffledDeck } from './deck.ts';
import { isJoker } from './card.ts';
import type { Card, StandardCard, JokerCard } from './types.ts';

describe('deck utilities', () => {
  describe('createDeck', () => {
    test('creates a deck with 54 cards', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(54);
    });

    test('contains 52 standard cards', () => {
      const deck = createDeck();
      const standardCards = deck.filter((card) => card.type === 'standard');
      expect(standardCards).toHaveLength(52);
    });

    test('contains 2 jokers', () => {
      const deck = createDeck();
      const jokers = deck.filter((card) => card.type === 'joker');
      expect(jokers).toHaveLength(2);
    });

    test('contains one red and one black joker', () => {
      const deck = createDeck();
      const jokers = deck.filter((card) => isJoker(card)) as JokerCard[];
      const variants = jokers.map((j) => j.jokerVariant);
      expect(variants).toContain('red');
      expect(variants).toContain('black');
    });

    test('contains all 4 suits', () => {
      const deck = createDeck();
      const standardCards = deck.filter((card) => card.type === 'standard') as StandardCard[];
      const suits = new Set(standardCards.map((card) => card.suit));
      expect(suits.size).toBe(4);
      expect(suits.has('hearts')).toBe(true);
      expect(suits.has('diamonds')).toBe(true);
      expect(suits.has('clubs')).toBe(true);
      expect(suits.has('spades')).toBe(true);
    });

    test('contains 13 cards of each suit', () => {
      const deck = createDeck();
      const standardCards = deck.filter((card) => card.type === 'standard') as StandardCard[];

      const suitCounts = {
        hearts: standardCards.filter((c) => c.suit === 'hearts').length,
        diamonds: standardCards.filter((c) => c.suit === 'diamonds').length,
        clubs: standardCards.filter((c) => c.suit === 'clubs').length,
        spades: standardCards.filter((c) => c.suit === 'spades').length,
      };

      expect(suitCounts.hearts).toBe(13);
      expect(suitCounts.diamonds).toBe(13);
      expect(suitCounts.clubs).toBe(13);
      expect(suitCounts.spades).toBe(13);
    });

    test('jokers have value 0 or 15', () => {
      const deck = createDeck();
      const jokers = deck.filter((card) => isJoker(card)) as JokerCard[];

      for (const joker of jokers) {
        expect([0, 15]).toContain(joker.value);
      }
    });

    test('joker values are randomized (statistical test)', () => {
      // Run multiple deck creations and check that joker values vary
      const results = { high: 0, low: 0 };

      for (let i = 0; i < 100; i++) {
        const deck = createDeck();
        const jokers = deck.filter((card) => isJoker(card)) as JokerCard[];
        for (const joker of jokers) {
          if (joker.value === 15) results.high++;
          else results.low++;
        }
      }

      // With 200 jokers (100 decks × 2 jokers), we expect roughly 100 high and 100 low
      // Allow for statistical variance (should be very unlikely to get <50 or >150)
      expect(results.high).toBeGreaterThan(50);
      expect(results.low).toBeGreaterThan(50);
    });
  });

  describe('shuffleDeck', () => {
    test('returns a new array (immutable)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).not.toBe(deck);
    });

    test('preserves all cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(54);

      // Check all cards are present by comparing sorted values
      const originalValues = deck.map((c) => c.value).sort((a, b) => a - b);
      const shuffledValues = shuffled.map((c) => c.value).sort((a, b) => a - b);
      expect(shuffledValues).toEqual(originalValues);
    });

    test('produces different order from original', () => {
      const deck = createDeck();

      // Run multiple shuffles to ensure at least one differs
      let foundDifferent = false;
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleDeck(deck);
        const sameOrder = deck.every((card, index) => {
          const shuffledCard = shuffled[index];
          return shuffledCard && card.value === shuffledCard.value;
        });
        if (!sameOrder) {
          foundDifferent = true;
          break;
        }
      }
      expect(foundDifferent).toBe(true);
    });

    test('produces different results on multiple calls', () => {
      const deck = createDeck();
      const shuffle1 = shuffleDeck(deck);
      const shuffle2 = shuffleDeck(deck);

      // Compare first 10 cards - extremely unlikely to be identical
      const firstTenSame = shuffle1.slice(0, 10).every((card, i) => {
        const card2 = shuffle2[i];
        return card2 && card.value === card2.value && card.type === card2.type;
      });

      // This could theoretically fail but probability is astronomically low
      expect(firstTenSame).toBe(false);
    });
  });

  describe('createShuffledDeck', () => {
    test('creates and shuffles a deck in one call', () => {
      const deck = createShuffledDeck();
      expect(deck).toHaveLength(54);
    });

    test('deck is shuffled (not in original order)', () => {
      const originalDeck = createDeck();
      const shuffledDeck = createShuffledDeck();

      // Check that order differs (at least first few cards)
      const firstFewMatch = originalDeck.slice(0, 5).every((card, i) => {
        const shuffledCard = shuffledDeck[i];
        if (!shuffledCard) return false;
        if (card.type !== shuffledCard.type) return false;
        if (card.type === 'standard' && shuffledCard.type === 'standard') {
          return card.suit === shuffledCard.suit && card.rank === shuffledCard.rank;
        }
        return card.value === shuffledCard.value;
      });

      // Very unlikely that first 5 cards are in exact same order after shuffle
      expect(firstFewMatch).toBe(false);
    });
  });
});
