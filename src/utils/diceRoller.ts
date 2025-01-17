import type { SpecialDieFace } from '@/types/diceTypes';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

// Special die has 6 faces:
// 3 barbarian (red)
// 1 merchant (yellow)
// 1 politics (green)
// 1 science (blue)
export const SPECIAL_DIE_FACES: readonly SpecialDieFace[] = Object.freeze([
  'barbarian',
  'barbarian',
  'barbarian',
  'merchant',
  'politics',
  'science'
]) as const;

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
    const array = [...this.combinations];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    this.combinations = array;
    this.currentIndex = 0;
  }

  public roll(): DiceRoll {
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }
    
    const roll = { ...this.combinations[this.currentIndex++] };
    
    if (this.useSpecialDie) {
      roll.specialDie = SPECIAL_DIE_FACES[Math.floor(this.randomFn() * SPECIAL_DIE_FACES.length)];
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
    return Math.max(0, this.combinations.length - this.discardCount - this.currentIndex);
  }
}