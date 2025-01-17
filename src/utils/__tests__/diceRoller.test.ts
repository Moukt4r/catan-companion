import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  let mockRandom: jest.SpyInstance;

  beforeEach(() => {
    mockRandom = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mockRandom.mockRestore();
  });

  it('should roll two dice with values between 1 and 6', () => {
    const roller = new DiceRoller();
    mockRandom.mockReturnValue(0.5); // Middle value
    
    const { dice } = roller.roll();
    expect(dice).toHaveLength(2);
    dice.forEach(value => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    });
  });

  it('should calculate correct sum', () => {
    const roller = new DiceRoller();
    mockRandom
      .mockReturnValueOnce(0) // First die roll: 1
      .mockReturnValueOnce(0.99); // Second die roll: 6

    const { dice, total } = roller.roll();
    expect(dice).toEqual([1, 6]);
    expect(total).toBe(7);
  });

  it('should handle special die faces with correct distribution', () => {
    const roller = new DiceRoller(undefined, true);
    const faceCount = new Map<string, number>();
    
    // Roll 600 times (100 * number of faces)
    for (let i = 0; i < 600; i++) {
      mockRandom.mockReturnValue(i / 600); // Ensure even distribution
      const { specialDie } = roller.roll();
      if (specialDie) {
        faceCount.set(specialDie, (faceCount.get(specialDie) || 0) + 1);
      }
    }

    // Check distribution matches SPECIAL_DIE_FACES
    const expectedCounts = SPECIAL_DIE_FACES.reduce((acc, face) => {
      acc.set(face, (acc.get(face) || 0) + 1);
      return acc;
    }, new Map<string, number>());

    expectedCounts.forEach((expectedCount, face) => {
      const actualCount = faceCount.get(face) || 0;
      expect(actualCount).toBeGreaterThan(0);
      // Each face should appear roughly proportionally
      const expectedRatio = expectedCount / SPECIAL_DIE_FACES.length;
      const actualRatio = actualCount / 600;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.1);
    });
  });

  it('should provide deterministic rolls with custom random function', () => {
    // Create a deterministic random function that cycles through values
    let counter = 0;
    const customRandom = () => {
      counter = (counter + 1) % 6;
      return counter / 6;
    };

    const roller = new DiceRoller(undefined, false, customRandom);
    const firstRoll = roller.roll();
    counter = 0; // Reset counter
    const secondRoll = roller.roll();

    // Both rolls should be identical since we reset the counter
    expect(secondRoll.dice).toEqual(firstRoll.dice);
    expect(secondRoll.total).toBe(firstRoll.total);
  });

  it('should maintain discard history', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    let counter = 0;
    mockRandom.mockImplementation(() => (counter++) / 36);

    // First set of rolls
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    
    // After discard, next roll should be different
    counter = 0; // Reset counter
    const roll3 = roller.roll();

    expect(roll3.dice).not.toEqual(roll1.dice);
    expect(roll3.dice).not.toEqual(roll2.dice);
  });

  it('should track remaining rolls correctly', () => {
    const roller = new DiceRoller(4); // Discard 4 combinations
    expect(roller.getRemainingRolls()).toBe(32); // 36 - 4 = 32

    // Roll a few times
    roller.roll();
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(30); // 32 - 2 = 30

    // Roll until near discard
    for (let i = 0; i < 28; i++) {
      roller.roll();
    }
    expect(roller.getRemainingRolls()).toBe(32); // Should have reshuffled
  });

  it('should handle discard count changes', () => {
    const roller = new DiceRoller(4);
    roller.setDiscardCount(8);
    expect(roller.getDiscardCount()).toBe(8);
    expect(roller.getRemainingRolls()).toBe(28); // 36 - 8 = 28

    // Invalid discard counts should throw
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
  });

  it('should toggle special die correctly', () => {
    const roller = new DiceRoller(4, false);
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