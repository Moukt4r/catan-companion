import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  it('should initialize with default values', () => {
    const roller = new DiceRoller();
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 4 (default discard)
  });

  it('should initialize with custom discard count', () => {
    const roller = new DiceRoller(8);
    expect(roller.getRemainingRolls()).toBe(28); // 36 - 8
  });

  it('should throw error for invalid discard count', () => {
    expect(() => new DiceRoller(-1)).toThrow('Discard count must be between 0 and 35');
    expect(() => new DiceRoller(36)).toThrow('Discard count must be between 0 and 35');
  });

  it('should roll dice within valid range', () => {
    const roller = new DiceRoller();
    for (let i = 0; i < 100; i++) {
      const roll = roller.roll();
      expect(roll.dice1).toBeGreaterThanOrEqual(1);
      expect(roll.dice1).toBeLessThanOrEqual(6);
      expect(roll.dice2).toBeGreaterThanOrEqual(1);
      expect(roll.dice2).toBeLessThanOrEqual(6);
      expect(roll.sum).toBe(roll.dice1 + roll.dice2);
    }
  });

  it('should reshuffle when exhausting combinations', () => {
    const roller = new DiceRoller(32); // Only 4 rolls before reshuffle
    const rolls = new Set();

    // Roll more than available combinations to force reshuffle
    for (let i = 0; i < 8; i++) {
      const { dice1, dice2 } = roller.roll();
      rolls.add(`${dice1},${dice2}`);
    }

    expect(rolls.size).toBeGreaterThan(4);
  });

  it('should handle special die correctly', () => {
    const roller = new DiceRoller(4, true);
    const specialFaces = new Set<string>();

    // Roll enough times to see all special die faces
    for (let i = 0; i < 100; i++) {
      const roll = roller.roll();
      expect(roll.specialDie).toBeDefined();
      expect(SPECIAL_DIE_FACES).toContain(roll.specialDie);
      if (roll.specialDie) {
        specialFaces.add(roll.specialDie);
      }
    }

    // Should have seen all special die faces
    expect(specialFaces.size).toBe(SPECIAL_DIE_FACES.length);
  });

  it('should not include special die when disabled', () => {
    const roller = new DiceRoller(4, false);
    const roll = roller.roll();
    expect(roll.specialDie).toBeUndefined();
  });

  it('should toggle special die usage', () => {
    const roller = new DiceRoller(4, false);
    let roll = roller.roll();
    expect(roll.specialDie).toBeUndefined();

    roller.setUseSpecialDie(true);
    roll = roller.roll();
    expect(roll.specialDie).toBeDefined();

    roller.setUseSpecialDie(false);
    roll = roller.roll();
    expect(roll.specialDie).toBeUndefined();
  });

  it('should update discard count', () => {
    const roller = new DiceRoller(4);
    expect(roller.getRemainingRolls()).toBe(32);

    roller.setDiscardCount(8);
    expect(roller.getRemainingRolls()).toBe(28);
  });

  it('should throw error for invalid discard count update', () => {
    const roller = new DiceRoller();
    expect(() => roller.setDiscardCount(-1)).toThrow('Discard count must be between 0 and 35');
    expect(() => roller.setDiscardCount(36)).toThrow('Discard count must be between 0 and 35');
  });

  it('should provide deterministic rolls with custom random function', () => {
    let index = 0;
    const mockRandom = () => {
      const values = [0, 0.2, 0.4, 0.6, 0.8];
      return values[index++ % values.length];
    };

    const roller = new DiceRoller(4, true, mockRandom);
    const firstRoll = roller.roll();
    
    // Reset mock and create new roller
    index = 0;
    const roller2 = new DiceRoller(4, true, mockRandom);
    const secondRoll = roller2.roll();

    // Should get same rolls with same random sequence
    expect(firstRoll).toEqual(secondRoll);
  });

  it('should update remaining rolls after each roll', () => {
    const roller = new DiceRoller(4);
    const initial = roller.getRemainingRolls();
    
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(initial - 1);

    roller.roll();
    expect(roller.getRemainingRolls()).toBe(initial - 2);
  });

  it('should provide uniform distribution of rolls', () => {
    const roller = new DiceRoller(0); // No discards for this test
    const counts = new Map<string, number>();
    const rolls = 3600; // 100 times each combination

    for (let i = 0; i < rolls; i++) {
      const { dice1, dice2 } = roller.roll();
      const key = `${dice1},${dice2}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Each combination should appear roughly equally
    const expectedCount = rolls / 36;
    const tolerance = expectedCount * 0.2; // Allow 20% deviation

    for (const count of counts.values()) {
      expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
    }
  });
});