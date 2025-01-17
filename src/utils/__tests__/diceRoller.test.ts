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
    mockRandom.mockImplementation(() => 0.5); // Should give middle values
    
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
      .mockReturnValueOnce(0) // First die: 1
      .mockReturnValueOnce(0.99); // Second die: 6

    const { dice, sum } = roller.roll();
    expect(dice).toEqual([1, 6]);
    expect(sum).toBe(7);
  });

  it('should handle special die correctly', () => {
    const roller = new DiceRoller();
    const faces = new Set<string>();
    
    // Roll multiple times to see all faces
    for (let i = 0; i < SPECIAL_DIE_FACES.length; i++) {
      mockRandom.mockReturnValueOnce(i / SPECIAL_DIE_FACES.length);
      const face = roller.rollSpecialDie();
      faces.add(face);
    }
    
    // Should have seen each face
    expect(faces.size).toBe(SPECIAL_DIE_FACES.length);
    SPECIAL_DIE_FACES.forEach(face => {
      expect(faces.has(face)).toBe(true);
    });
  });

  it('should maintain discard history', () => {
    const roller = new DiceRoller(2); // Discard after every 2 rolls
    mockRandom.mockImplementation(() => 0.5); // Consistent rolls

    expect(roller.getRemainingRolls()).toBe(2);
    
    // First roll
    const roll1 = roller.roll();
    expect(roller.getRemainingRolls()).toBe(1);
    
    // Second roll
    const roll2 = roller.roll();
    expect(roller.getRemainingRolls()).toBe(2); // Should reset after discard
    
    // Values should be different from discarded rolls
    const roll3 = roller.roll();
    expect(roll3).not.toEqual(roll1);
  });

  it('should provide deterministic rolls with custom random function', () => {
    const customRandom = jest.fn()
      .mockReturnValueOnce(0) // First die: 1
      .mockReturnValueOnce(0.99); // Second die: 6

    const roller = new DiceRoller(undefined, customRandom);
    const roll1 = roller.roll();
    const roll2 = roller.roll();
    
    // Both rolls should use the same random values
    expect(roll1.dice).toEqual(roll2.dice);
    expect(customRandom).toHaveBeenCalledTimes(4); // 2 calls per roll
  });

  it('should track roll history', () => {
    const roller = new DiceRoller(3);
    mockRandom.mockImplementation(() => 0.5);

    // Make several rolls
    const rolls = [
      roller.roll(),
      roller.roll(),
      roller.roll()
    ];

    const history = roller.getHistory();
    expect(history).toHaveLength(3);
    expect(history).toEqual(expect.arrayContaining(rolls));
  });

  it('should discard rolls correctly', () => {
    const roller = new DiceRoller(2);
    mockRandom.mockImplementation(() => 0.5);

    // Roll twice to fill discard
    roller.roll();
    roller.roll();
    
    // Next roll should be different
    const newRoll = roller.roll();
    const history = roller.getHistory();
    
    // Last roll should be different from previous ones
    expect(history[0]).not.toEqual(newRoll);
    expect(history[1]).not.toEqual(newRoll);
  });

  it('should reset discard counter after cycling through all combinations', () => {
    const roller = new DiceRoller(1); // Discard after each roll
    mockRandom.mockImplementation(() => 0.5);

    // Make enough rolls to cycle through all combinations
    const totalCombinations = 36; // 6x6 possible dice combinations
    for (let i = 0; i < totalCombinations + 1; i++) {
      roller.roll();
    }

    // Should have reset and restarted the cycle
    expect(roller.getRemainingRolls()).toBe(1);
  });
});