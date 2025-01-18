import type { SpecialDieFace } from '@/types/diceTypes';

interface DiceRollInternal {
  dice1: number;
  dice2: number;
  total: number;
}

export interface DiceRoll {
  dice: [number, number];
  total: number;
  specialDie: SpecialDieFace | null;
}

// Special die has 6 faces with distribution:
// 3 barbarian (red) - 50%
// 1 merchant (yellow) - 16.67%
// 1 politics (green) - 16.67%
// 1 science (blue) - 16.67%
export const SPECIAL_DIE_FACES: readonly SpecialDieFace[] = Object.freeze([
  'barbarian',
  'barbarian',
  'barbarian',
  'merchant',
  'politics',
  'science'
]) as const;

export class DiceRoller {
  private discardedCombinations: Set<string>;
  private combinations: DiceRollInternal[];
  private currentIndex: number;
  private discardCount: number;
  private useSpecialDie: boolean;
  private randomFn: () => number;
  private readonly history: DiceRoll[];

  constructor(discardCount: number = 4, useSpecialDie: boolean = false, randomFn: () => number = Math.random) {
    if (discardCount < 0 || discardCount >= 36) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.discardedCombinations = new Set();
    this.history = [];
    
    this.shuffle();
  }

  private generateCombinations(): DiceRollInternal[] {
    const combinations: DiceRollInternal[] = [];
    for (let dice1 = 1; dice1 <= 6; dice1++) {
      for (let dice2 = 1; dice2 <= 6; dice2++) {
        combinations.push({
          dice1,
          dice2,
          total: dice1 + dice2
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
    this.discardedCombinations.clear();
  }

  private rollSpecialDie(): SpecialDieFace {
    // Use randomFn to select directly from SPECIAL_DIE_FACES
    // This preserves the intended distribution (3/6 barbarian, 1/6 others)
    const index = Math.floor(this.randomFn() * SPECIAL_DIE_FACES.length);
    return SPECIAL_DIE_FACES[index];
  }

  private getCombinationKey(roll: DiceRollInternal): string {
    return `${roll.dice1},${roll.dice2}`;
  }

  public roll(): DiceRoll {
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }

    const roll = this.combinations[this.currentIndex++];
    const key = this.getCombinationKey(roll);
    this.discardedCombinations.add(key);

    const diceRoll: DiceRoll = {
      dice: [roll.dice1, roll.dice2],
      total: roll.total,
      specialDie: this.useSpecialDie ? this.rollSpecialDie() : null
    };

    this.history.push(diceRoll);
    return diceRoll;
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
    // If we're at the end and about to shuffle
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      return this.combinations.length - this.discardCount - 1;
    }
    // Otherwise return remaining in current deck
    return this.combinations.length - this.discardCount - this.currentIndex;
  }

  public getHistory(): DiceRoll[] {
    return [...this.history];
  }
}