export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private shouldTriggerAttack: boolean = false;

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
    return this.shouldTriggerAttack || this.position >= this.threshold;
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
    this.attackCount++;
    if (this.isDefended()) {
      this.defenseCount++;
    }
    this.knightCount = 0;
    this.position = 0;
    this.shouldTriggerAttack = false;
    this.lastUpdateTime = Date.now();
  }

  advancePosition(): void {
    const nextPosition = this.position + 1;

    // First check if we're about to trigger an attack
    if (nextPosition >= this.threshold) {
      // Set the flag first, then handle state transitions
      this.shouldTriggerAttack = true;
      this.position = this.threshold;
      this.lastUpdateTime = Date.now();
      
      // Now handle the attack, which will reset position and clear the flag
      this.handleAttack();
    } else {
      // Normal position advancement
      this.position = nextPosition;
      this.lastUpdateTime = Date.now();
    }
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = newThreshold;

    // Check if current position would trigger attack with new threshold
    if (this.position >= this.threshold) {
      this.shouldTriggerAttack = true;
      this.handleAttack();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.lastUpdateTime = Date.now();
  }
}