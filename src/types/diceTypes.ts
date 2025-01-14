export type SpecialDieFace = 'barbarian' | 'merchant' | 'politics' | 'science' | 'trade' | 'none';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}