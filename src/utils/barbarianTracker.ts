export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private underAttack: boolean = false;

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
    return this.underAttack;
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

  private processAttack(): void {
    this.underAttack = true;
    this.attackCount++;
    if (this.isDefended()) {
      this.defenseCount++;
    }
    this.position = 0;
    this.knightCount = 0;
  }

  advancePosition(): void {
    // If already at threshold, trigger attack and return
    if (this.position >= this.threshold - 1) {
      this.processAttack();
      return;
    }

    // Move forward one space
    this.position++;
    
    // If reached threshold, trigger attack
    if (this.position >= this.threshold - 1) {
      this.processAttack();
    }

    this.lastUpdateTime = Date.now();
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    
    // If current position would exceed or reach the new threshold, trigger attack
    if (this.position >= newThreshold - 1) {
      this.processAttack();
    }
    
    this.threshold = newThreshold;
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
  }

  endAttack(): void {
    this.underAttack = false;
  }
}