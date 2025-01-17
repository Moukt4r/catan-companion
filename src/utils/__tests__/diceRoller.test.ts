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
    // Create a deterministic sequence: 0, 0.2, 0.4, 0.6, 0.8, 1.0
    let counter = 0;
    const customRandom = () => {
      const value = counter / 5;
      counter = (counter + 1) % 6;
      return value;
    };

    const roller = new DiceRoller(undefined, false, customRandom);
    const roll1 = roller.roll();
    
    // Reset counter to get same sequence
    counter = 0;
    const roll2 = roller.roll();
    
    expect(roll2.dice).toEqual(roll1.dice);
    expect(roll2.total).toBe(roll1.total);
  });

  it('should maintain discard state', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    mockRandom.mockReturnValue(0.5); // Consistent rolls
    
    const roll1 = roller.roll();
    expect(roller.getRemainingRolls()).toBe(1); // One roll remaining before discard
    
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
});