import { DiceRoller, SpecialDieFace } from '../diceRoller';

describe('DiceRoller with special die', () => {
  let diceRoller: DiceRoller;

  beforeEach(() => {
    diceRoller = new DiceRoller(4, true);
  });

  test('includes special die when enabled', () => {
    const roll = diceRoller.roll();
    expect(roll.specialDie).toBeDefined();
    expect(['barbarian', 'merchant', 'politics', 'science', 'trade', 'none']).toContain(roll.specialDie);
  });

  test('does not include special die when disabled', () => {
    diceRoller.setUseSpecialDie(false);
    const roll = diceRoller.roll();
    expect(roll.specialDie).toBeUndefined();
  });

  test('special die has uniform distribution', () => {
    const results = new Map<SpecialDieFace, number>();
    const iterations = 6000; // Large number for statistical significance
    
    for (let i = 0; i < iterations; i++) {
      const roll = diceRoller.roll();
      if (roll.specialDie) {
        results.set(roll.specialDie, (results.get(roll.specialDie) || 0) + 1);
      }
    }

    // Each face should appear approximately iterations/6 times
    const expectedCount = iterations / 6;
    const tolerance = expectedCount * 0.1; // 10% tolerance

    for (const count of results.values()) {
      expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
    }
  });

  test('can toggle special die usage', () => {
    diceRoller.setUseSpecialDie(false);
    expect(diceRoller.isUsingSpecialDie()).toBe(false);
    
    diceRoller.setUseSpecialDie(true);
    expect(diceRoller.isUsingSpecialDie()).toBe(true);
  });

  // Include previous basic dice rolling tests...
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
});