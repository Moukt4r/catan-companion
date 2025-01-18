export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private currentAttack: boolean = false;
  private postAttackReset: boolean = false;

  constructor(initialThreshold: number = 7) {
    if (initialThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = initialThreshold;
    this.lastUpdateTime = Date.now();
  }

  getPosition(): number {
    return this.postAttackReset ? 0 : this.position;
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
    return this.currentAttack;
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
    this.currentAttack = true;
    this.postAttackReset = false;
    this.attackCount++;
    
    if (this.isDefended()) {
      this.defenseCount++;
    }

    this.knightCount = 0;
    this.postAttackReset = true;
  }

  advancePosition(): void {
    // Clear previous attack state if we're starting a new move
    if (this.postAttackReset) {
      this.position = 0;
      this.currentAttack = false;
      this.postAttackReset = false;
      this.lastUpdateTime = Date.now();
      return;
    }

    // Calculate next position
    const nextPosition = this.position + 1;

    // Handle attack threshold
    if (nextPosition >= this.threshold) {
      // Trigger attack at threshold
      this.position = this.threshold;
      this.handleAttack();
    } else {
      this.position = nextPosition;
      this.currentAttack = false;
    }

    this.lastUpdateTime = Date.now();
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    
    this.threshold = newThreshold;

    // Check if current position would trigger attack with new threshold
    if (this.position >= newThreshold) {
      this.handleAttack();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.currentAttack = false;
    this.postAttackReset = false;
    this.lastUpdateTime = Date.now();
  }
}