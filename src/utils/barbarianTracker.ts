export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private stateChanged: boolean = false;

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
    if (this.stateChanged) {
      // If we've changed state during this turn, use position
      return this.position >= this.threshold;
    }
    // Otherwise, check if next position would trigger attack
    return (this.position + 1) >= this.threshold;
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
    this.stateChanged = false;
  }

  decrementKnights(): void {
    if (this.knightCount > 0) {
      this.knightCount--;
    }
    this.stateChanged = false;
  }

  startMove(): void {
    this.isMoving = true;
    this.stateChanged = false;
  }

  endMove(): void {
    this.isMoving = false;
    this.stateChanged = false;
  }

  private handleAttack(): void {
    // Mark that we're changing state
    this.stateChanged = true;
    
    // Record attack and update counters
    this.attackCount++;
    if (this.isDefended()) {
      this.defenseCount++;
    }

    // Reset state
    this.position = 0;
    this.knightCount = 0;
    this.lastUpdateTime = Date.now();
  }

  advancePosition(): void {
    // Reset state change flag at start of turn
    this.stateChanged = false;

    // Check if next position would trigger attack
    if ((this.position + 1) >= this.threshold) {
      this.handleAttack();
    } else {
      // Regular movement
      this.position++;
      this.lastUpdateTime = Date.now();
    }
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    
    this.threshold = newThreshold;
    this.stateChanged = false;

    // Check if current position would trigger attack with new threshold
    if (this.position >= newThreshold) {
      this.handleAttack();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
    this.stateChanged = false;
  }
}