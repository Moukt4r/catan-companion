export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;

  constructor(initialThreshold: number = 7) {
    if (initialThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = initialThreshold;
    this.lastUpdateTime = Date.now();
  }

  getPosition(): number {
    return this.position;
  }

  getKnightCount(): number {
    return this.knightCount;
  }

  getThreshold(): number {
    return this.threshold;
  }

  getAttackCount(): number {
    return this.attackCount;
  }

  getDefenseCount(): number {
    return this.defenseCount;
  }

  isBarbarianMoving(): boolean {
    return this.isMoving;
  }

  getLastUpdateTime(): number {
    return this.lastUpdateTime;
  }

  isUnderAttack(): boolean {
    return this.position >= this.threshold;
  }

  isDefended(): boolean {
    return this.knightCount >= 3;
  }

  getDefenseNeeded(): number {
    const needed = 3 - this.knightCount;
    return needed > 0 ? needed : 0;
  }

  incrementKnights(): void {
    this.knightCount++;
  }

  decrementKnights(): void {
    if (this.knightCount > 0) {
      this.knightCount--;
    }
  }

  startMove(): void {
    this.isMoving = true;
  }

  endMove(): void {
    this.isMoving = false;
  }

  advancePosition(): void {
    if (this.position + 1 >= this.threshold) {
      // If we're about to exceed threshold, trigger attack and reset
      this.position = this.threshold; // Set to threshold for isUnderAttack check
      this.lastUpdateTime = Date.now();
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }
      this.position = 0; // Reset position after attack
      this.knightCount = 0; // Reset knights after attack
    } else {
      this.position++;
      this.lastUpdateTime = Date.now();
    }
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = newThreshold;
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
  }
}