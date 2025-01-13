export type SpecialDieFace = 'barbarian' | 'merchant' | 'politics' | 'science' | 'trade' | 'none';

interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

export class DiceRoller {
  private combinations: DiceRoll[];
  private currentIndex: number;
  private discardCount: number;
  private useSpecialDie: boolean;
  private readonly specialDieFaces: SpecialDieFace[] = [
    'barbarian',
    'merchant',
    'politics',
    'science',
    'trade',
    'none'
  ];

  constructor(discardCount: number = 4, useSpecialDie: boolean = false) {
    this.discardCount = discardCount;
    this.useSpecialDie = useSpecialDie;
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
    // Fisher-Yates shuffle
    for (let i = this.combinations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.combinations[i], this.combinations[j]] = 
      [this.combinations[j], this.combinations[i]];
    }
    this.currentIndex = 0;
  }

  public roll(): DiceRoll {
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }
    
    const roll = { ...this.combinations[this.currentIndex++] };
    
    if (this.useSpecialDie) {
      roll.specialDie = this.specialDieFaces[
        Math.floor(Math.random() * this.specialDieFaces.length)
      ];
    }
    
    return roll;
  }

  public setDiscardCount(count: number): void {
    if (count < 0 || count >= this.combinations.length) {
      throw new Error('Invalid discard count');
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

  public isUsingSpecialDie(): boolean {
    return this.useSpecialDie;
  }
}