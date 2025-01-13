/**
 * Class representing a fair dice roller for Catan
 * Uses all 36 possible combinations with configurable discard count
 */
export class DiceRoller {
  private combinations: DiceRoll[];
  private currentIndex: number;
  private discardCount: number;
  private randomFn: () => number;

  /**
   * Creates a new DiceRoller instance
   * @param discardCount Number of combinations to discard (0-35)
   * @param randomFn Optional custom random number generator for testing
   * @throws {Error} If discardCount is invalid
   */
  constructor(discardCount: number = 4, randomFn: () => number = Math.random) {
    if (discardCount < 0 || discardCount >= 36) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = discardCount;
    this.randomFn = randomFn;
    this.combinations = this.generateCombinations();
    this.currentIndex = 0;
    this.shuffle();
  }

  /**
   * Generates all possible dice combinations
   * @returns Array of all possible dice combinations
   */
  protected generateCombinations(): DiceRoll[] {
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

  /**
   * Shuffles the dice combinations using Fisher-Yates algorithm
   */
  protected shuffle(): void {
    for (let i = this.combinations.length - 1; i > 0; i--) {
      const j = Math.floor(this.randomFn() * (i + 1));
      [this.combinations[i], this.combinations[j]] = 
      [this.combinations[j], this.combinations[i]];
    }
    this.currentIndex = 0;
  }

  /**
   * Rolls the dice
   * @returns The next dice roll combination
   */
  public roll(): DiceRoll {
    if (this.currentIndex >= this.combinations.length - this.discardCount) {
      this.shuffle();
    }
    return this.combinations[this.currentIndex++];
  }

  /**
   * Sets a new discard count
   * @param count New discard count (0-35)
   * @throws {Error} If count is invalid
   */
  public setDiscardCount(count: number): void {
    if (count < 0 || count >= this.combinations.length) {
      throw new Error('Discard count must be between 0 and 35');
    }
    this.discardCount = count;
    this.shuffle();
  }

  /**
   * Gets the number of remaining rolls before shuffle
   * @returns Number of remaining rolls
   */
  public getRemainingRolls(): number {
    return this.combinations.length - this.discardCount - this.currentIndex;
  }
}