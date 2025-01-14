import type { SpecialDieFace } from '../types/diceTypes';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

export const SPECIAL_DIE_FACES: readonly SpecialDieFace[] = Object.freeze([
  'barbarian',
  'merchant',
  'politics',
  'science',
  'trade',
  'none'
]) as const;

export const isSpecialDieFace = (face: string): face is SpecialDieFace => {
  return SPECIAL_DIE_FACES.includes(face as SpecialDieFace);
};

export class DiceRoller {
  private combinations: DiceRoll[];
  private currentIndex: number;
  private discardCount: number;
  private useSpecialDie: boolean;
  private randomFn: () => number;

  constructor(discardCount: number = 4, useSpecialDie: boolean = false, randomFn: () => number = Math.random) {
    if (discardCount < 0 || discardCount >= 36) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.shuffle();
  }

  private generateCombinations(): DiceRoll[] {
    const combinations: DiceRoll[] = [];
    for (let dice1 = 1; dice1 <= 6; dice1++) {
      for (let dice2 = 1; dice2 <= 6; dice2++) {
        combinations.push({
          dice1,
          dice2,
          sum: dice1 + dice2
        });
      }
    }
    return combinations;
  }

  private shuffle(): void {
    for (let i = this.combinations.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [this.combinations[i], this.combinations[j]] = 
      [this.combinations[j], this.combinations[i]];
    }
    this.currentIndex = 0;
  }

  private rollSpecialDie(): SpecialDieFace {
    const index = Math.floor(this.randomFn() * SPECIAL_DIE_FACES.length);
    return SPECIAL_DIE_FACES[index];
  }

  public roll(): DiceRoll {
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }
    
    const roll = { ...this.combinations[this.currentIndex++] };
    
    if (this.useSpecialDie) {
      roll.specialDie = this.rollSpecialDie();
    }
    
    return roll;
  }

  public setDiscardCount(count: number): void {
    if (count < 0 || count >= this.combinations.length) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = count;
    this.shuffle();
  }

  public setUseSpecialDie(use: boolean): void {
    this.useSpecialDie = use;
  }

  public getRemainingRolls(): number {
    return this.combinations.length - this.discardCount - this.currentIndex;
  }
}