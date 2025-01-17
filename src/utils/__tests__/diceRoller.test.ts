import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  it('should initialize with default values', () => {
    const roller = new DiceRoller();
    expect(roller.getDiscardCount()).toBe(4);
    expect(roller.hasSpecialDie()).toBe(false);
  });

  it('should initialize with custom discard count', () => {
    const roller = new DiceRoller(2);
    expect(roller.getDiscardCount()).toBe(2);
  });

  it('should throw error for invalid discard count', () => {
    expect(() => new DiceRoller(-1)).toThrow();
    expect(() => new DiceRoller(36)).toThrow();
  });

  it('should roll dice within valid range', () => {
    const roller = new DiceRoller();
    for (let i = 0; i < 100; i++) {
      const { dice } = roller.roll();
      expect(dice[0]).toBeGreaterThanOrEqual(1);
      expect(dice[0]).toBeLessThanOrEqual(6);
      expect(dice[1]).toBeGreaterThanOrEqual(1);
      expect(dice[1]).toBeLessThanOrEqual(6);
    }
  });

  it('should handle special die correctly', () => {
    // Create a predictable random function that cycles through 0 to 1
    let counter = 0;
    const mockRandom = () => (counter++) % SPECIAL_DIE_FACES.length / SPECIAL_DIE_FACES.length;
    
    const roller = new DiceRoller(4, true, mockRandom);
    const faces = new Set<string>();
    
    // Roll enough times to see each face
    for (let i = 0; i < SPECIAL_DIE_FACES.length * 2; i++) {
      const { specialDie } = roller.roll();
      if (specialDie) {
        faces.add(specialDie);
      }
    }
    
    // Should have seen each face
    expect(faces.size).toBe(SPECIAL_DIE_FACES.length);
    SPECIAL_DIE_FACES.forEach(face => {
      expect(faces.has(face)).toBe(true);
    });
  });

  it('should not include special die when disabled', () => {
    const roller = new DiceRoller(4, false);
    for (let i = 0; i < 10; i++) {
      const { specialDie } = roller.roll();
      expect(specialDie).toBeNull();
    }
  });

  it('should toggle special die usage', () => {
    const roller = new DiceRoller();
    expect(roller.hasSpecialDie()).toBe(false);
    
    roller.setSpecialDie(true);
    expect(roller.hasSpecialDie()).toBe(true);
    
    roller.setSpecialDie(false);
    expect(roller.hasSpecialDie()).toBe(false);
  });

  it('should update discard count', () => {
    const roller = new DiceRoller(4);
    roller.setDiscardCount(2);
    expect(roller.getDiscardCount()).toBe(2);
  });

  it('should throw error for invalid discard count update', () => {
    const roller = new DiceRoller();
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
  });

  it('should provide deterministic rolls with custom random function', () => {
    const mockRandom = jest.fn().mockReturnValue(0.5);
    const roller = new DiceRoller(4, false, mockRandom);
    
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    expect(roll1.dice).toEqual(roll2.dice);
  });

  it('should update remaining rolls after each roll', () => {
    const roller = new DiceRoller(4);
    const initialRolls = roller.getRemainingRolls();
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(initialRolls - 1);
  });

  it('should reshuffle when exhausting combinations', () => {
    const roller = new DiceRoller(4);
    const totalCombinations = roller.getRemainingRolls();
    
    // Roll through all combinations
    for (let i = 0; i < totalCombinations; i++) {
      roller.roll();
    }
    
    // Should have reshuffled automatically
    expect(roller.getRemainingRolls()).toBe(totalCombinations);
  });

  it('should provide uniform distribution of rolls', () => {
    const roller = new DiceRoller(4);
    const rollCounts = new Map<number, number>();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const { total } = roller.roll();
      rollCounts.set(total, (rollCounts.get(total) || 0) + 1);
    }

    // Check each possible roll total appears a reasonable number of times
    for (let total = 2; total <= 12; total++) {
      const count = rollCounts.get(total) || 0;
      const expected = iterations * probability(total);
      const tolerance = expected * 0.3;  // 30% tolerance

      expect(Math.abs(count - expected)).toBeLessThan(tolerance);
    }
  });
});

// Helper function to calculate probability of a dice total
function probability(total: number): number {
  if (total < 2 || total > 12) return 0;
  const ways = Math.min(total - 1, 13 - total);
  return ways / 36;
}