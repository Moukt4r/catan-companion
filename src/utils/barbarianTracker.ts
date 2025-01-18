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

  advancePosition(): void {
    if (this.position >= this.threshold - 1) {
      // Set attack flag
      this.underAttack = true;
      
      // Record attack
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }

      // Reset position and knights
      this.position = 0;
      this.knightCount = 0;
    } else {
      this.position++;
    }

    this.lastUpdateTime = Date.now();
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    
    // If current position would exceed the new threshold, reset position
    if (this.position >= newThreshold) {
      this.underAttack = true;
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }
      this.position = 0;
      this.knightCount = 0;
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