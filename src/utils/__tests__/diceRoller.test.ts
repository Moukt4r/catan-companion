import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  let mockRandom: jest.SpyInstance;

  beforeEach(() => {
    mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    mockRandom.mockRestore();
  });

  it('should roll two dice with values between 1 and 6', () => {
    const roller = new DiceRoller();
    const { dice } = roller.roll();
    expect(dice).toHaveLength(2);
    dice.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  it('should calculate correct sum', () => {
    const roller = new DiceRoller();
    // Mock for 1,6 combination
    mockRandom.mockReturnValueOnce(0).mockReturnValueOnce(0.99);

    const { dice, total } = roller.roll();
    expect(dice).toEqual([1, 6]);
    expect(total).toBe(7);
  });

  it('should handle special die correctly', () => {
    const roller = new DiceRoller(undefined, true);
    
    // Count occurrences of each face
    const faceCount = Object.fromEntries(SPECIAL_DIE_FACES.map(face => [face, 0]));
    
    // Roll multiple times with controlled random values
    for (let i = 0; i < SPECIAL_DIE_FACES.length; i++) {
      // Set random to return i/length to cycle through faces
      mockRandom.mockReturnValueOnce(i / SPECIAL_DIE_FACES.length);
      const { specialDie } = roller.roll();
      if (specialDie) {
        faceCount[specialDie]++;
      }
    }

    // Verify distributions
    expect(faceCount['barbarian']).toBeGreaterThan(0);
    expect(faceCount['merchant']).toBeGreaterThan(0);
    expect(faceCount['politics']).toBeGreaterThan(0);
    expect(faceCount['science']).toBeGreaterThan(0);
    
    // 3 faces should be barbarian
    const barbarianCount = faceCount['barbarian'];
    expect(barbarianCount).toBe(3);
  });

  it('should provide deterministic rolls with deterministic random function', () => {
    let counter = 0;
    const customRandom = () => counter++ / 6;

    const roller = new DiceRoller(undefined, false, customRandom);
    
    // Reset counter and do first roll
    counter = 0;
    const roll1 = roller.roll();

    // Reset counter and do second roll
    counter = 0;
    const roll2 = roller.roll();

    // Same random sequence should produce same dice
    expect(roll2.dice).toEqual(roll1.dice);
  });

  it('should maintain discard history', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    
    // After discard, next roll should be different
    const roll3 = roller.roll();

    // Third roll should be different from discarded rolls
    expect(roll3.dice).not.toEqual(roll1.dice);
    expect(roll3.dice).not.toEqual(roll2.dice);
  });

  it('should track remaining rolls correctly', () => {
    const roller = new DiceRoller(4); // Discard after 4 rolls
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 4 = 32

    roller.roll();
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(30); // 32 - 2 = 30

    // Roll enough to trigger reshuffle
    for (let i = 0; i < 30; i++) {
      roller.roll();
    }

    // After reshuffle, we should be back to max remaining
    expect(roller.getRemainingRolls()).toBe(32);
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

  it('should handle special die toggle', () => {
    const roller = new DiceRoller();
    expect(roller.hasSpecialDie()).toBe(false);
    
    roller.setSpecialDie(true);
    expect(roller.hasSpecialDie()).toBe(true);
    const { specialDie } = roller.roll();
    expect(SPECIAL_DIE_FACES).toContain(specialDie);
    
    roller.setSpecialDie(false);
    expect(roller.hasSpecialDie()).toBe(false);
    expect(roller.roll().specialDie).toBeNull();
  });
});