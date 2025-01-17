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
    mockRandom.mockReturnValue(0.5); // Middle value for predictable results
    
    const { dice } = roller.roll();
    expect(dice).toHaveLength(2);
    dice.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  it('should handle special die faces with correct distribution', () => {
    const roller = new DiceRoller(undefined, true);
    const faceCount = new Map<string, number>();
    
    // Reset mocking for initial shuffle
    mockRandom.mockReturnValue(0.5);
    
    // Mock random to return fixed value for special die roll, varying value for shuffle
    for (let i = 0; i < SPECIAL_DIE_FACES.length; i++) {
      mockRandom.mockReturnValueOnce(i / SPECIAL_DIE_FACES.length); // For special die
      
      const { specialDie } = roller.roll();
      if (specialDie) faceCount.set(specialDie, (faceCount.get(specialDie) || 0) + 1);
    }

    // Verify distribution
    expect(faceCount.get('barbarian')).toBe(3); // Should see barbarian 3 times
    expect(faceCount.get('merchant')).toBe(1);
    expect(faceCount.get('politics')).toBe(1);
    expect(faceCount.get('science')).toBe(1);
  });

  it('should provide deterministic rolls', () => {
    let counter = 0;
    mockRandom.mockImplementation(() => {
      counter = (counter + 1) % 6;
      return 0.5; // Use constant value for predictable shuffle
    });

    const roller = new DiceRoller();
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    
    // With fixed random value, combinations should come from shuffled deck in order
    expect(roll1.total).toBeLessThanOrEqual(12);
    expect(roll1.total).toBeGreaterThanOrEqual(2);
    expect(roll2.total).toBeLessThanOrEqual(12);
    expect(roll2.total).toBeGreaterThanOrEqual(2);
  });

  it('should maintain discard tracking correctly', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    const rolls = new Set<string>();
    
    // Use fixed random for consistent shuffling
    mockRandom.mockReturnValue(0.5);
    
    // Make some rolls and track them
    const roll1 = roller.roll();
    rolls.add(`${roll1.dice[0]},${roll1.dice[1]}`);
    expect(roller.getRemainingRolls()).toBe(33); // 36 - 2 - 1 = 33 (total - discard - used)
    
    const roll2 = roller.roll();
    rolls.add(`${roll2.dice[0]},${roll2.dice[1]}`);
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 2 - 2 = 32
    
    // Next roll after discard should be different
    const roll3 = roller.roll();
    const roll3Key = `${roll3.dice[0]},${roll3.dice[1]}`;
    
    // Shouldn't see same combinations from previous rolls
    expect(rolls.has(roll3Key)).toBe(false);
    expect(roller.getRemainingRolls()).toBe(33); // 36 - 2 - 1 = 33 (after reset)
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

  it('should properly handle special die toggling', () => {
    const roller = new DiceRoller();
    mockRandom.mockReturnValue(0); // Use 0 for predictable results
    
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.roll().specialDie).toBeNull();
    
    roller.setSpecialDie(true);
    expect(roller.hasSpecialDie()).toBe(true);
    expect(roller.roll().specialDie).toBe('barbarian'); // First face with 0 index
    
    roller.setSpecialDie(false);
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.roll().specialDie).toBeNull();
  });
});