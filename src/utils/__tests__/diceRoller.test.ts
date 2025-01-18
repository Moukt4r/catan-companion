import { DiceRoller, SPECIAL_DIE_FACES } from '../diceRoller';

describe('DiceRoller', () => {
  it('should initialize with default values', () => {
    const roller = new DiceRoller();
    expect(roller.getRemainingRolls()).toBe(32); // 36 total - 4 discarded
  });

  it('should throw error for invalid discard count', () => {
    expect(() => new DiceRoller(-1)).toThrow();
    expect(() => new DiceRoller(36)).toThrow();
    expect(() => new DiceRoller(100)).toThrow();
  });

  it('should roll two dice with valid values', () => {
    const roller = new DiceRoller();
    const roll = roller.roll();
    
    expect(roll.dice1).toBeGreaterThanOrEqual(1);
    expect(roll.dice1).toBeLessThanOrEqual(6);
    expect(roll.dice2).toBeGreaterThanOrEqual(1);
    expect(roll.dice2).toBeLessThanOrEqual(6);
    expect(roll.sum).toBe(roll.dice1 + roll.dice2);
  });

  it('should handle special die faces with correct distribution', () => {
    // Mock random function to return predictable values
    let mockRandomIndex = 0;
    const mockRandom = () => {
      const values = [0, 0.2, 0.4, 0.6, 0.8, 0.99];
      return values[mockRandomIndex++ % values.length];
    };

    const roller = new DiceRoller(4, true, mockRandom);
    const results = new Set<string>();

    // Roll enough times to get all special die faces
    for (let i = 0; i < SPECIAL_DIE_FACES.length; i++) {
      const roll = roller.roll();
      if (roll.specialDie) {
        results.add(roll.specialDie);
      }
    }

    // Check if we got all possible faces
    expect(results.has('barbarian')).toBe(true);
    expect(results.has('merchant')).toBe(true);
    expect(results.has('politics')).toBe(true);
    expect(results.has('science')).toBe(true);
  });

  it('should provide deterministic rolls with mock random function', () => {
    const mockRandom = jest.fn()
      .mockReturnValueOnce(0)    // First shuffle
      .mockReturnValue(0.5);     // All subsequent calls (special die)

    const roller = new DiceRoller(4, true, mockRandom);
    const roll = roller.roll();

    expect(roll.dice1).toBeGreaterThanOrEqual(1);
    expect(roll.dice2).toBeGreaterThanOrEqual(1);
    expect(roll.specialDie).toBeDefined();
    expect(mockRandom).toHaveBeenCalled();
  });

  it('should maintain correct tracking of available combinations', () => {
    const roller = new DiceRoller(4);
    const availableCombos = 32; // 36 total - 4 discarded

    // Roll all but one
    for (let i = 0; i < availableCombos - 1; i++) {
      roller.roll();
      expect(roller.getRemainingRolls()).toBe(availableCombos - (i + 1));
    }

    // Roll the last one - should trigger reshuffle
    roller.roll();
    expect(roller.getRemainingRolls()).toBe(availableCombos - 1);
  });

  it('should validate discard count', () => {
    const roller = new DiceRoller(4);
    
    expect(() => roller.setDiscardCount(-1)).toThrow();
    expect(() => roller.setDiscardCount(36)).toThrow();
    
    roller.setDiscardCount(10);
    expect(roller.getRemainingRolls()).toBe(26); // 36 total - 10 discarded
  });

  it('should properly handle special die toggling', () => {
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
});