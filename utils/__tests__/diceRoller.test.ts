import { DiceRoller } from '../diceRoller';

describe('DiceRoller', () => {
  let diceRoller: DiceRoller;

  beforeEach(() => {
    diceRoller = new DiceRoller();
  });

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

  test('discards correct number of combinations', () => {
    const discardCount = 4;
    const diceRoller = new DiceRoller(discardCount);
    const rolls = [];
    
    while (diceRoller.getRemainingRolls() > 0) {
      rolls.push(diceRoller.roll());
    }
    
    expect(rolls.length).toBe(36 - discardCount);
  });

  test('shuffles and resets after using all combinations', () => {
    const firstSet = new Set<string>();
    const secondSet = new Set<string>();
    
    // Roll through first complete set
    for (let i = 0; i < 32; i++) {
      const roll = diceRoller.roll();
      firstSet.add(`${roll.dice1},${roll.dice2}`);
    }
    
    // Roll through second complete set
    for (let i = 0; i < 32; i++) {
      const roll = diceRoller.roll();
      secondSet.add(`${roll.dice1},${roll.dice2}`);
    }
    
    expect(firstSet.size).toBe(32);
    expect(secondSet.size).toBe(32);
  });

  test('allows changing discard count', () => {
    diceRoller.setDiscardCount(6);
    const rolls = [];
    
    while (diceRoller.getRemainingRolls() > 0) {
      rolls.push(diceRoller.roll());
    }
    
    expect(rolls.length).toBe(30);
  });

  test('throws error for invalid discard count', () => {
    expect(() => diceRoller.setDiscardCount(-1)).toThrow();
    expect(() => diceRoller.setDiscardCount(36)).toThrow();
  });
});