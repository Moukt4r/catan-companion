export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private pendingAttack: boolean = false;

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
    return this.pendingAttack || this.position >= this.threshold;
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

  private handleAttack(): void {
    // We need to set pendingAttack before any state changes
    this.pendingAttack = true;
    
    // Count attack and defense before state reset
    this.attackCount++;
    if (this.isDefended()) {
      this.defenseCount++;
    }
    
    // Only update these for the next tick
    setTimeout(() => {
      this.position = 0;
      this.knightCount = 0;
      this.pendingAttack = false;
    }, 0);
  }

  advancePosition(): void {
    // Check if this move will trigger attack
    const willReachThreshold = (this.position + 1) >= this.threshold;

    if (willReachThreshold && !this.pendingAttack) {
      this.position = this.threshold; // Set position to threshold
      this.lastUpdateTime = Date.now();
      this.handleAttack(); // This will handle attack and schedule reset
    } else if (!this.pendingAttack) {
      this.position++;
      this.lastUpdateTime = Date.now();
    }
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = newThreshold;

    // Check if current position would trigger attack with new threshold
    if (this.position >= this.threshold && !this.pendingAttack) {
      this.handleAttack();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
    this.pendingAttack = false;
  }
}