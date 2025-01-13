import { DiceRoller, SPECIAL_DIE_FACES, isSpecialDieFace } from '../diceRoller';

describe('DiceRoller with special die', () => {
  let diceRoller: DiceRoller;
  
  beforeEach(() => {
    diceRoller = new DiceRoller();
  });

  describe('special die functionality', () => {
    test('does not include special die by default', () => {
      const roll = diceRoller.roll();
      expect(roll.specialDie).toBeUndefined();
    });

    test('includes special die when enabled', () => {
      diceRoller.setUseSpecialDie(true);
      const roll = diceRoller.roll();
      expect(roll.specialDie).toBeDefined();
      expect(SPECIAL_DIE_FACES).toContain(roll.specialDie);
    });

    test('maintains state between consecutive rolls', () => {
      diceRoller.setUseSpecialDie(true);
      const rolls = Array.from({ length: 5 }, () => diceRoller.roll());
      expect(rolls.every(roll => roll.specialDie)).toBe(true);

      diceRoller.setUseSpecialDie(false);
      const moreRolls = Array.from({ length: 5 }, () => diceRoller.roll());
      expect(moreRolls.every(roll => roll.specialDie === undefined)).toBe(true);
    });

    test('special die has uniform distribution', () => {
      diceRoller.setUseSpecialDie(true);
      const faces = new Map<string, number>();
      const rolls = 6000;

      for (let i = 0; i < rolls; i++) {
        const roll = diceRoller.roll();
        if (roll.specialDie) {
          faces.set(roll.specialDie, (faces.get(roll.specialDie) || 0) + 1);
        }
      }

      // Each face should appear approximately rolls/6 times
      const expectedCount = rolls / 6;
      const tolerance = expectedCount * 0.1; // 10% tolerance

      for (const count of faces.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }
    });

    test('getAllSpecialDieFaces returns all faces', () => {
      const faces = DiceRoller.getAllSpecialDieFaces();
      expect(faces).toEqual(SPECIAL_DIE_FACES);
      expect(Object.isFrozen(faces)).toBe(true);
    });
  });

  describe('type guards', () => {
    test('isSpecialDieFace validates face types', () => {
      expect(isSpecialDieFace('barbarian')).toBe(true);
      expect(isSpecialDieFace('invalid')).toBe(false);
      expect(isSpecialDieFace('')).toBe(false);
    });
  });

  // Include previous basic dice rolling tests...
});