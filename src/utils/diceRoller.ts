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
  private readonly totalCombinations = 36; // 6x6 possible combinations
  private combinations: DiceRoll[];
  private currentIndex: number;
  private discardCount: number;
  private useSpecialDie: boolean;
  private randomFn: () => number;
  private hasShuffled: boolean;

  constructor(discardCount: number = 4, useSpecialDie: boolean = false, randomFn: () => number = Math.random) {
    if (discardCount < 0 || discardCount >= this.totalCombinations) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.hasShuffled = false;
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
    // Use Fisher-Yates shuffle
    for (let i = this.combinations.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [this.combinations[i], this.combinations[j]] = 
      [this.combinations[j], this.combinations[i]];
    }
  }

  public roll(): DiceRoll {
    // Check if we've used all available combinations
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
      this.hasShuffled = true;
      this.currentIndex = 1; // Start at 1 to indicate one roll used after shuffle
    } else {
      this.currentIndex++;
    }
    
    const roll = { ...this.combinations[this.currentIndex - 1] };
    
    if (this.useSpecialDie) {
      roll.specialDie = SPECIAL_DIE_FACES[Math.floor(this.randomFn() * SPECIAL_DIE_FACES.length)];
    }
    
    return roll;
  }

  public setDiscardCount(count: number): void {
    if (count < 0 || count >= this.totalCombinations) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = count;
    this.currentIndex = 0;
    this.hasShuffled = false;
    this.shuffle();
  }

  public setUseSpecialDie(use: boolean): void {
    this.useSpecialDie = use;
  }

  public getRemainingRolls(): number {
    const totalAvailable = this.combinations.length - this.discardCount;
    
    if (this.hasShuffled) {
      return totalAvailable - 1;
    }
    
    return totalAvailable - this.currentIndex;
  }
}