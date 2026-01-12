import { describe, test, expect } from 'bun:test';
import {
  createStandardCard,
  createJoker,
  compareCards,
  getCardDisplay,
  getCardColor,
  isJoker,
  getSuitSymbol,
  SUITS,
  RANKS,
} from './card.ts';

describe('card utilities', () => {
  describe('constants', () => {
    test('SUITS contains all 4 suits', () => {
      expect(SUITS).toEqual(['hearts', 'diamonds', 'clubs', 'spades']);
    });

    test('RANKS contains all 13 ranks in order', () => {
      expect(RANKS).toHaveLength(13);
      expect(RANKS[0]).toBe('2');
      expect(RANKS[12]).toBe('A');
    });
  });

  describe('createStandardCard', () => {
    test('creates card with correct properties', () => {
      const card = createStandardCard('hearts', 'A');
      expect(card.type).toBe('standard');
      expect(card.suit).toBe('hearts');
      expect(card.rank).toBe('A');
      expect(card.value).toBe(14);
    });

    test('assigns correct values to each rank', () => {
      expect(createStandardCard('spades', '2').value).toBe(2);
      expect(createStandardCard('spades', '10').value).toBe(10);
      expect(createStandardCard('spades', 'J').value).toBe(11);
      expect(createStandardCard('spades', 'Q').value).toBe(12);
      expect(createStandardCard('spades', 'K').value).toBe(13);
      expect(createStandardCard('spades', 'A').value).toBe(14);
    });
  });

  describe('createJoker', () => {
    test('creates high joker with value 15', () => {
      const joker = createJoker('red', true);
      expect(joker.type).toBe('joker');
      expect(joker.jokerVariant).toBe('red');
      expect(joker.value).toBe(15);
    });

    test('creates low joker with value 0', () => {
      const joker = createJoker('black', false);
      expect(joker.type).toBe('joker');
      expect(joker.jokerVariant).toBe('black');
      expect(joker.value).toBe(0);
    });
  });

  describe('compareCards', () => {
    test('returns positive when first card is higher', () => {
      const ace = createStandardCard('hearts', 'A');
      const two = createStandardCard('spades', '2');
      expect(compareCards(ace, two)).toBeGreaterThan(0);
    });

    test('returns negative when first card is lower', () => {
      const two = createStandardCard('hearts', '2');
      const king = createStandardCard('spades', 'K');
      expect(compareCards(two, king)).toBeLessThan(0);
    });

    test('returns zero for equal values', () => {
      const heartsQueen = createStandardCard('hearts', 'Q');
      const spadesQueen = createStandardCard('spades', 'Q');
      expect(compareCards(heartsQueen, spadesQueen)).toBe(0);
    });

    test('high joker beats ace', () => {
      const highJoker = createJoker('red', true);
      const ace = createStandardCard('spades', 'A');
      expect(compareCards(highJoker, ace)).toBeGreaterThan(0);
    });

    test('low joker loses to two', () => {
      const lowJoker = createJoker('black', false);
      const two = createStandardCard('hearts', '2');
      expect(compareCards(lowJoker, two)).toBeLessThan(0);
    });
  });

  describe('getCardDisplay', () => {
    test('displays standard card with rank and suit symbol', () => {
      const card = createStandardCard('hearts', 'A');
      expect(getCardDisplay(card)).toBe('A♥');
    });

    test('displays high joker correctly', () => {
      const joker = createJoker('red', true);
      expect(getCardDisplay(joker)).toBe('Joker [HIGH]');
    });

    test('displays low joker correctly', () => {
      const joker = createJoker('black', false);
      expect(getCardDisplay(joker)).toBe('Joker [LOW]');
    });
  });

  describe('getCardColor', () => {
    test('hearts and diamonds are red', () => {
      expect(getCardColor(createStandardCard('hearts', '5'))).toBe('red');
      expect(getCardColor(createStandardCard('diamonds', 'K'))).toBe('red');
    });

    test('clubs and spades are black', () => {
      expect(getCardColor(createStandardCard('clubs', '7'))).toBe('black');
      expect(getCardColor(createStandardCard('spades', 'A'))).toBe('black');
    });

    test('joker color matches variant', () => {
      expect(getCardColor(createJoker('red', true))).toBe('red');
      expect(getCardColor(createJoker('black', false))).toBe('black');
    });
  });

  describe('isJoker', () => {
    test('returns true for joker cards', () => {
      expect(isJoker(createJoker('red', true))).toBe(true);
      expect(isJoker(createJoker('black', false))).toBe(true);
    });

    test('returns false for standard cards', () => {
      expect(isJoker(createStandardCard('hearts', 'A'))).toBe(false);
    });
  });

  describe('getSuitSymbol', () => {
    test('returns correct symbols for each suit', () => {
      expect(getSuitSymbol('hearts')).toBe('♥');
      expect(getSuitSymbol('diamonds')).toBe('♦');
      expect(getSuitSymbol('clubs')).toBe('♣');
      expect(getSuitSymbol('spades')).toBe('♠');
    });
  });
});
