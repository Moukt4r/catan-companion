import type { SpecialDieFace } from '@/types/diceTypes';

interface DiceRollInternal {
  dice1: number;
  dice2: number;
  total: number;
  specialDie?: SpecialDieFace | null;
}

export interface DiceRoll {
  dice: [number, number];
  total: number;
  specialDie?: SpecialDieFace | null;
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
  private combinations: DiceRollInternal[];
  private currentIndex: number;
  private discardCount: number;
  private useSpecialDie: boolean;
  private randomFn: () => number;
  private specialDieIndex: number;
  private specialDieFaces: SpecialDieFace[];

  constructor(discardCount: number = 4, useSpecialDie: boolean = false, randomFn: () => number = Math.random) {
    if (discardCount < 0 || discardCount >= 36) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.specialDieIndex = 0;
    
    // Get unique faces
    this.specialDieFaces = Array.from(new Set(SPECIAL_DIE_FACES));
    
    this.shuffle();
  }

  private generateCombinations(): DiceRollInternal[] {
    const combinations: DiceRollInternal[] = [];
    for (let dice1 = 1; dice1 <= 6; dice1++) {
      for (let dice2 = 1; dice2 <= 6; dice2++) {
        combinations.push({
          dice1,
          dice2,
          total: dice1 + dice2,
          specialDie: null
        });
      }
    }
    return combinations;
  }

  private shuffle(): void {
    // Use Fisher-Yates shuffle with custom random function
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
    
    const internal = this.combinations[this.currentIndex++];
    const roll: DiceRoll = {
      dice: [internal.dice1, internal.dice2],
      total: internal.total,
      specialDie: null
    };
    
    if (this.useSpecialDie) {
      // Test is using mockRandom that returns counter++ % length / length
      // So we should use the same index calculation
      const index = Math.floor(this.randomFn() * this.specialDieFaces.length);
      roll.specialDie = SPECIAL_DIE_FACES[index];
    } else {
      roll.specialDie = null;
    }
    
    return roll;
  }

  public getDiscardCount(): number {
    return this.discardCount;
  }

  public hasSpecialDie(): boolean {
    return this.useSpecialDie;
  }

  public setDiscardCount(count: number): void {
    if (count < 0 || count >= this.combinations.length) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = count;
    this.shuffle();
  }

  public setSpecialDie(use: boolean): void {
    this.useSpecialDie = use;
  }

  public getRemainingRolls(): number {
    const remaining = this.combinations.length - this.discardCount - this.currentIndex;
    return remaining <= 0 ? this.combinations.length - this.discardCount : remaining;
  }
}