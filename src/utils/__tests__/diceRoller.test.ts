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
    
    // Mock random to cycle through values to ensure we see all faces
    for (let i = 0; i < SPECIAL_DIE_FACES.length; i++) {
      mockRandom
        .mockReturnValueOnce(i / SPECIAL_DIE_FACES.length) // For special die
        .mockReturnValueOnce(0.5)  // For shuffle
        .mockReturnValueOnce(0.5); // For shuffle
        
      const { specialDie } = roller.roll();
      if (specialDie) {
        faceCount.set(specialDie, (faceCount.get(specialDie) || 0) + 1);
      }
    }

    // Verify that we've seen all face types
    const uniqueFaces = Array.from(new Set(SPECIAL_DIE_FACES));
    uniqueFaces.forEach(face => {
      expect(faceCount.has(face)).toBe(true);
      expect(faceCount.get(face)).toBeGreaterThan(0);
    });

    // Verify barbarian appears more frequently (3 faces)
    expect(faceCount.get('barbarian')).toBe(3);
  });

  it('should provide deterministic rolls with fixed random seed', () => {
    // Use fixed sequence for predictable results
    const sequence = [0.1, 0.2, 0.3, 0.4];
    let counter = 0;
    const customRandom = () => sequence[counter++ % sequence.length];
    
    const roller = new DiceRoller(undefined, false, customRandom);
    
    // First roll
    counter = 0; // Reset sequence
    const roll1 = roller.roll();
    
    // Second roll with same sequence
    counter = 0; // Reset sequence
    const roll2 = roller.roll();
    
    // Rolls should be identical when using same random sequence
    expect(roll2.dice).toEqual(roll1.dice);
    expect(roll2.total).toBe(roll1.total);
  });

  it('should maintain discard tracking', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    const usedCombinations = new Set<string>();
    
    mockRandom.mockReturnValue(0.5); // Use consistent random value
    
    // Make first roll
    const roll1 = roller.roll();
    const key1 = `${roll1.dice[0]},${roll1.dice[1]}`;
    usedCombinations.add(key1);
    
    // Check remaining rolls
    const totalCombos = 36;
    const discardSize = 2;
    expect(roller.getRemainingRolls()).toBe(totalCombos - discardSize - 1); // 33 after first roll
    
    // Make second roll
    const roll2 = roller.roll();
    const key2 = `${roll2.dice[0]},${roll2.dice[1]}`;
    
    // After discard point, should reset remaining rolls
    expect(roller.getRemainingRolls()).toBe(totalCombos - discardSize); // 34 after reset
    
    // Next roll should not match previous rolls
    const roll3 = roller.roll();
    const key3 = `${roll3.dice[0]},${roll3.dice[1]}`;
    expect(usedCombinations.has(key3)).toBe(false);
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
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.roll().specialDie).toBeNull();
    
    roller.setSpecialDie(true);
    mockRandom.mockReturnValue(0);
    expect(roller.hasSpecialDie()).toBe(true);
    expect(roller.roll().specialDie).toBe('barbarian'); // First face with 0 random value
    
    roller.setSpecialDie(false);
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.roll().specialDie).toBeNull();
  });
});