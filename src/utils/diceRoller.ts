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
    this.validate(discardCount);
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.shuffle();
  }

  private validate(discardCount: number): void {
    if (discardCount < 0 || discardCount >= 36) {
      throw new Error('Discard count must be between 0 and 35');
    }
  }

  private generateCombinations(): DiceRoll[] {
    const combinations: DiceRoll[] = [];
    // Generate all possible combinations of two dice
    for (let dice1 = 1; dice1 <= 6; dice1++) {
      for (let dice2 = 1; dice2 <= 6; dice2++) {
        combinations.push({
          dice1,
          dice2,
          sum: dice1 + dice2,
        });
      }
    }
    if (combinations.length !== 36) {
      throw new Error(`Expected 36 combinations, but got ${combinations.length}`);
    }
    return combinations;
  }

  private shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.combinations.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [this.combinations[i], this.combinations[j]] = [this.combinations[j], this.combinations[i]];
    }
    // Reset index after shuffle
    this.currentIndex = 0;
  }

  public roll(): DiceRoll {
    // If we've used too many combinations, reshuffle
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }
    
    // Get the next combination
    const roll = { ...this.combinations[this.currentIndex] };
    this.currentIndex++;
    
    // Add special die if enabled
    if (this.useSpecialDie) {
      const specialDieIndex = Math.floor(this.randomFn() * SPECIAL_DIE_FACES.length);
      roll.specialDie = SPECIAL_DIE_FACES[specialDieIndex];
    }
    
    // Validate the roll
    if (!this.isValidRoll(roll)) {
      throw new Error(`Invalid roll generated: ${JSON.stringify(roll)}`);
    }
    
    return roll;
  }

  private isValidRoll(roll: DiceRoll): boolean {
    return (
      typeof roll.dice1 === 'number' &&
      typeof roll.dice2 === 'number' &&
      typeof roll.sum === 'number' &&
      roll.dice1 >= 1 &&
      roll.dice1 <= 6 &&
      roll.dice2 >= 1 &&
      roll.dice2 <= 6 &&
      roll.sum === roll.dice1 + roll.dice2
    );
  }

  public setDiscardCount(count: number): void {
    this.validate(count);
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