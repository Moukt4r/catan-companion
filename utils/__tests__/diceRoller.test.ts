import { DiceRoller } from '../diceRoller';

describe('DiceRoller', () => {
  let diceRoller: DiceRoller;

  beforeEach(() => {
    diceRoller = new DiceRoller();
  });

  describe('constructor', () => {
    test('throws error for invalid discard count', () => {
      expect(() => new DiceRoller(-1)).toThrow();
      expect(() => new DiceRoller(36)).toThrow();
    });

    test('accepts custom random function', () => {
      const mockRandom = jest.fn().mockReturnValue(0.5);
      const roller = new DiceRoller(4, mockRandom);
      roller.roll();
      expect(mockRandom).toHaveBeenCalled();
    });
  });

  describe('roll distribution', () => {
    test('provides fair distribution of sums', () => {
      const sums = new Map<number, number>();
      const rolls = 1000;
      
      for (let i = 0; i < rolls; i++) {
        const roll = diceRoller.roll();
        sums.set(roll.sum, (sums.get(roll.sum) || 0) + 1);
      }

      // Check that each sum appears with expected frequency
      const expectedFrequencies = {
        2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36, 7: 6/36,
        8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
      };

      for (const [sum, count] of sums.entries()) {
        const actualFrequency = count / rolls;
        const expectedFrequency = expectedFrequencies[sum as keyof typeof expectedFrequencies];
        const tolerance = 0.1; // 10% tolerance

        expect(Math.abs(actualFrequency - expectedFrequency))
          .toBeLessThan(tolerance);
      }
    });
  });

  describe('boundary conditions', () => {
    test('handles exactly 32 rolls before reshuffle', () => {
      const rolls = new Set<string>();
      
      // Roll 32 times (36 - 4 discard)
      for (let i = 0; i < 32; i++) {
        const roll = diceRoller.roll();
        rolls.add(`${roll.dice1},${roll.dice2}`);
      }
      
      expect(rolls.size).toBe(32);
      
      // Next roll should trigger reshuffle
      const nextRoll = diceRoller.roll();
      expect(nextRoll).toBeDefined();
    });
  });
});