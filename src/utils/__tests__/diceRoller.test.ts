import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  let mockRandom: jest.SpyInstance;

  beforeEach(() => {
    mockRandom = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mockRandom.mockRestore();
  });

  it('should initialize with default values', () => {
    const roller = new DiceRoller();
    expect(roller.getDiscardCount()).toBe(4);
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 4 = 32
  });

  it('should roll two dice with valid values', () => {
    const roller = new DiceRoller();
    const { dice } = roller.roll();
    expect(dice).toHaveLength(2);
    dice.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  it('should correctly handle special die faces', () => {
    const roller = new DiceRoller(undefined, true);
    const seenFaces = new Set<string>();
    
    // Roll enough times to see all faces
    for (let i = 0; i < SPECIAL_DIE_FACES.length * 2; i++) {
      mockRandom.mockReturnValueOnce(i / (SPECIAL_DIE_FACES.length * 2));
      const { specialDie } = roller.roll();
      if (specialDie) {
        seenFaces.add(specialDie);
      }
    }

    // Should see all unique face types (4 types, even though 6 faces)
    expect(seenFaces.size).toBe(4); // barbarian, merchant, politics, science
    expect(seenFaces.has('barbarian')).toBe(true);
    expect(seenFaces.has('merchant')).toBe(true);
    expect(seenFaces.has('politics')).toBe(true);
    expect(seenFaces.has('science')).toBe(true);
  });

  it('should provide deterministic rolls', () => {
    mockRandom.mockReturnValue(0.5); // Use consistent value for all random calls
    const roller = new DiceRoller();
    
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    
    // With same random value, combinations should be different due to shuffle
    expect(roll2.dice[0]).not.toBe(roll1.dice[0]);
    expect(roll2.dice[1]).not.toBe(roll1.dice[1]);

    // But values should still be valid
    expect(roll1.dice[0]).toBeGreaterThanOrEqual(1);
    expect(roll1.dice[0]).toBeLessThanOrEqual(6);
    expect(roll1.dice[1]).toBeGreaterThanOrEqual(1);
    expect(roll1.dice[1]).toBeLessThanOrEqual(6);
  });

  it('should maintain discard state', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    mockRandom.mockReturnValue(0.5); // Consistent rolls
    
    const roll1 = roller.roll();
    expect(roller.getRemainingRolls()).toBe(33); // 36 - 2 - 1 = 33
    
    const roll2 = roller.roll();
    expect(roller.getRemainingRolls()).toBe(34); // Reset after discard (36 - 2 = 34)
    
    const roll3 = roller.roll();
    expect(roll3).not.toEqual(roll1); // Should not repeat discarded roll
    expect(roll3).not.toEqual(roll2);
  });

  it('should validate discard count', () => {
    const roller = new DiceRoller(4);
    
    // Valid changes
    expect(() => roller.setDiscardCount(0)).not.toThrow();
    expect(() => roller.setDiscardCount(35)).not.toThrow();
    
    // Invalid changes
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
  });

  it('should handle repeated rolls without duplicates', () => {
    const roller = new DiceRoller(4);
    const usedCombinations = new Set<string>();
    
    // Roll multiple times
    for (let i = 0; i < 32; i++) { // Roll through all non-discarded combinations
      const { dice } = roller.roll();
      const key = `${dice[0]},${dice[1]}`;
      
      // Each combination should be unique until reshuffle
      expect(usedCombinations.has(key)).toBe(false);
      usedCombinations.add(key);
    }

    // Next roll should start a new sequence
    usedCombinations.clear();
    const { dice } = roller.roll();
    const key = `${dice[0]},${dice[1]}`;
    expect(usedCombinations.has(key)).toBe(false);
  });
});