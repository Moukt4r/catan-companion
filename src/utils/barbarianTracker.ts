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
    return this.position === this.threshold; // Check for exact match with threshold
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
    // First calculate what the next position would be
    const nextPosition = this.position + 1;

    // If we're about to reach or exceed threshold
    if (nextPosition >= this.threshold) {
      // Set position to exactly threshold to trigger isUnderAttack
      this.position = this.threshold;
      this.lastUpdateTime = Date.now();

      // Record the attack and defense status
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }

      // Reset position and knights *after* attack is recorded
      this.knightCount = 0;
      this.position = 0;
    } else {
      // Normal movement
      this.position = nextPosition;
      this.lastUpdateTime = Date.now();
    }
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }

    const oldThreshold = this.threshold;
    this.threshold = newThreshold;

    // If current position would trigger attack with new threshold
    if (this.position >= newThreshold) {
      // First set position to exact threshold to trigger isUnderAttack
      const oldPosition = this.position;
      this.position = newThreshold;

      // Record attack
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }

      // Reset after attack
      this.position = 0;
      this.knightCount = 0;
      this.lastUpdateTime = Date.now();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
  }
}