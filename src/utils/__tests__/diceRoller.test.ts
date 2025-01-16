import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  it('should create valid dice combinations', () => {
    const roller = new DiceRoller();
    const roll = roller.roll();
    
    expect(roll.dice1).toBeGreaterThanOrEqual(1);
    expect(roll.dice1).toBeLessThanOrEqual(6);
    expect(roll.dice2).toBeGreaterThanOrEqual(1);
    expect(roll.dice2).toBeLessThanOrEqual(6);
    expect(roll.sum).toBe(roll.dice1 + roll.dice2);
  });

  it('should handle special die correctly', () => {
    // Use a controlled random function that cycles through indexes
    let currentIndex = 0;
    const mockRandom = () => {
      const value = currentIndex / 6; // Return values: 0, 1/6, 2/6, etc.
      currentIndex = (currentIndex + 1) % 6;
      return value;
    };

    const roller = new DiceRoller(4, true, mockRandom);
    const faces = new Set<string>();
    
    // Roll enough times to see all faces
    for (let i = 0; i < 6; i++) {
      const roll = roller.roll();
      expect(roll.specialDie).toBeDefined();
      if (roll.specialDie) {
        faces.add(roll.specialDie);
      }
    }

    // Should have seen all special die faces
    expect(faces.size).toBe(SPECIAL_DIE_FACES.length);
    SPECIAL_DIE_FACES.forEach(face => {
      expect(faces.has(face)).toBe(true);
    });
  });

  it('should not include special die when disabled', () => {
    const roller = new DiceRoller(4, false);
    const roll = roller.roll();
    expect(roll.specialDie).toBeUndefined();
  });

  it('should discard correct number of combinations', () => {
    const roller = new DiceRoller(4);
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 4 discards
  });

  it('should reshuffle when running out of combinations', () => {
    const roller = new DiceRoller(4);
    const firstSet = new Set();
    
    // Roll through all combinations
    for (let i = 0; i < 32; i++) {
      const roll = roller.roll();
      const key = `${roll.dice1}-${roll.dice2}`;
      expect(firstSet.has(key)).toBe(false); // No duplicates
      firstSet.add(key);
    }

    // Next roll should come from a fresh shuffle
    const nextRoll = roller.roll();
    expect(nextRoll.dice1).toBeGreaterThanOrEqual(1);
    expect(nextRoll.dice1).toBeLessThanOrEqual(6);
  });

  it('should validate discard count', () => {
    expect(() => new DiceRoller(-1)).toThrow();
    expect(() => new DiceRoller(36)).toThrow();
    
    const roller = new DiceRoller(4);
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
  });

  it('should set and get use special die', () => {
    const roller = new DiceRoller(4, false);
    expect(roller.roll().specialDie).toBeUndefined();
    
    roller.setUseSpecialDie(true);
    expect(roller.roll().specialDie).toBeDefined();
    
    roller.setUseSpecialDie(false);
    expect(roller.roll().specialDie).toBeUndefined();
  });
});
