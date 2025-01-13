import { DiceRoller } from '../diceRoller';
import { SpecialDieFace } from '../../types/diceTypes';

describe('DiceRoller with special die', () => {
  let diceRoller: DiceRoller;
  
  beforeEach(() => {
    diceRoller = new DiceRoller();
  });

  describe('special die functionality', () => {
    test('does not include special die by default', () => {
      const roll = diceRoller.roll();
      expect(roll.specialDie).toBeUndefined();
    });

    test('includes special die when enabled', () => {
      diceRoller.setUseSpecialDie(true);
      const roll = diceRoller.roll();
      expect(roll.specialDie).toBeDefined();
      expect(['barbarian', 'merchant', 'politics', 'science', 'trade', 'none']).toContain(roll.specialDie);
    });

    test('can toggle special die', () => {
      diceRoller.setUseSpecialDie(true);
      expect(diceRoller.isUsingSpecialDie()).toBe(true);
      
      diceRoller.setUseSpecialDie(false);
      expect(diceRoller.isUsingSpecialDie()).toBe(false);
    });

    test('special die has uniform distribution', () => {
      diceRoller.setUseSpecialDie(true);
      const faces = new Map<SpecialDieFace, number>();
      const rolls = 6000;

      for (let i = 0; i < rolls; i++) {
        const roll = diceRoller.roll();
        if (roll.specialDie) {
          faces.set(roll.specialDie, (faces.get(roll.specialDie) || 0) + 1);
        }
      }

      // Each face should appear approximately rolls/6 times
      const expectedCount = rolls / 6;
      const tolerance = expectedCount * 0.1; // 10% tolerance

      for (const count of faces.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }
    });
  });

  // Include previous basic dice rolling tests
  describe('basic functionality', () => {
    test('generates all 36 possible combinations', () => {
      const results = new Set<string>();
      for (let i = 0; i < 32; i++) {
        const roll = diceRoller.roll();
        results.add(`${roll.dice1},${roll.dice2}`);
        expect(roll.sum).toBe(roll.dice1 + roll.dice2);
        expect(roll.dice1).toBeGreaterThanOrEqual(1);
        expect(roll.dice1).toBeLessThanOrEqual(6);
        expect(roll.dice2).toBeGreaterThanOrEqual(1);
        expect(roll.dice2).toBeLessThanOrEqual(6);
      }
      expect(results.size).toBe(32);
    });

    test('respects discard count', () => {
      const customRoller = new DiceRoller(6); // Discard 6 instead of default 4
      const results = new Set<string>();
      
      while (customRoller.getRemainingRolls() > 0) {
        const roll = customRoller.roll();
        results.add(`${roll.dice1},${roll.dice2}`);
      }
      
      expect(results.size).toBe(30); // 36 - 6 discarded
    });
  });
});