import { SpecialDieFace } from '../types/diceTypes';

export const SPECIAL_DIE_FACES: readonly SpecialDieFace[] = Object.freeze([
  'barbarian',
  'merchant',
  'politics',
  'science',
  'trade',
  'none'
]) as const;

export class DiceRoller {
  // ... rest of the class implementation ...

  public static getAllSpecialDieFaces(): readonly SpecialDieFace[] {
    return SPECIAL_DIE_FACES;
  }
}