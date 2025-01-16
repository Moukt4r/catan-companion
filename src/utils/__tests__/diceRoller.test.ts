import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  it('should initialize with default values', () => {
    const roller = new DiceRoller();
    expect(roller.getRemainingRolls()).toBe(32); // 36 - default discard of 4
  });

  it('should initialize with custom discard count', () => {
    const roller = new DiceRoller(10);
    expect(roller.getRemainingRolls()).toBe(26); // 36 - 10
  });

  it('should throw error for invalid discard count', () => {
    expect(() => new DiceRoller(-1)).toThrow();
    expect(() => new DiceRoller(36)).toThrow();
  });

  it('should roll dice within valid range', () => {
    const roller = new DiceRoller();
    const rolls = new Set();

    // Roll enough times to see several combinations
    for (let i = 0; i < 10; i++) {
      const roll = roller.roll();
      expect(roll.dice1).toBeGreaterThanOrEqual(1);
      expect(roll.dice1).toBeLessThanOrEqual(6);
      expect(roll.dice2).toBeGreaterThanOrEqual(1);
      expect(roll.dice2).toBeLessThanOrEqual(6);
      expect(roll.sum).toBe(roll.dice1 + roll.dice2);
      rolls.add(`${roll.dice1}-${roll.dice2}`);
    }

    // Should see several unique combinations
    expect(rolls.size).toBeGreaterThan(1);
  });

  it('should reshuffle when exhausting combinations', () => {
    const roller = new DiceRoller(4); // 32 usable combinations
    const seen = new Set();

    // Roll through all combinations
    for (let i = 0; i < 32; i++) {
      const roll = roller.roll();
      const key = `${roll.dice1}-${roll.dice2}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }

    // Next roll should be valid after reshuffle
    const nextRoll = roller.roll();
    expect(nextRoll.dice1).toBeGreaterThanOrEqual(1);
    expect(nextRoll.dice1).toBeLessThanOrEqual(6);
  });

  it('should handle special die correctly', () => {
    // Create a sequence of indices to cycle through
    const sequence = [0, 1, 2, 3, 4, 5];
    let currentIndex = 0;
    const mockRandom = () => {
      // For regular dice, return 0 to avoid shuffling
      if (currentIndex >= sequence.length) return 0;
      // For special die, cycle through each face
      const value = sequence[currentIndex] / sequence.length;
      currentIndex++;
      return value;
    };

    const roller = new DiceRoller(4, true, mockRandom);
    const faces = new Set();

    // Roll enough times to see each face
    for (let i = 0; i < sequence.length; i++) {
      const roll = roller.roll();
      expect(roll.specialDie).toBeDefined();
      if (roll.specialDie) {
        faces.add(roll.specialDie);
      }
    }

    // Verify we've seen each face exactly once
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

  it('should toggle special die usage', () => {
    const roller = new DiceRoller(4, false);
    expect(roller.roll().specialDie).toBeUndefined();

    roller.setUseSpecialDie(true);
    expect(roller.roll().specialDie).toBeDefined();

    roller.setUseSpecialDie(false);
    expect(roller.roll().specialDie).toBeUndefined();
  });

  it('should update discard count', () => {
    const roller = new DiceRoller(4);
    expect(roller.getRemainingRolls()).toBe(32);

    roller.setDiscardCount(10);
    expect(roller.getRemainingRolls()).toBe(26);
  });

  it('should throw error for invalid discard count update', () => {
    const roller = new DiceRoller(4);
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
  });

  it('should provide deterministic rolls with custom random function', () => {
    let calls = 0;
    const mockRandom = () => {
      calls++;
      return 0; // Always return 0 for deterministic shuffling
    };

    const roller = new DiceRoller(4, false, mockRandom);
    const firstRoll = roller.roll();
    
    // Reset call counter
    calls = 0;
    
    const roller2 = new DiceRoller(4, false, mockRandom);
    const secondRoll = roller2.roll();

    // Should get same rolls with same random function
    expect(firstRoll.dice1).toBe(secondRoll.dice1);
    expect(firstRoll.dice2).toBe(secondRoll.dice2);
  });

  it('should update remaining rolls after each roll', () => {
    const roller = new DiceRoller(4); // 32 usable combinations
    const initial = roller.getRemainingRolls();
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(initial - 1);
  });

  it('should provide uniform distribution of rolls', () => {
    const roller = new DiceRoller(0); // Use all combinations
    const totals = new Map();

    // Roll many times to check distribution
    for (let i = 0; i < 1000; i++) {
      const roll = roller.roll();
      const sum = roll.dice1 + roll.dice2;
      totals.set(sum, (totals.get(sum) || 0) + 1);
    }

    // Check that all possible sums are seen
    for (let sum = 2; sum <= 12; sum++) {
      expect(totals.has(sum)).toBe(true);
    }

    // Most common should be 7 (6 ways to roll it)
    const mostCommon = Math.max(...Array.from(totals.values()));
    const seven = totals.get(7);
    expect(seven).toBe(mostCommon);
  });
});