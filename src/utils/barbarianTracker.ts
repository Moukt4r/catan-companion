export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private pendingAttack: boolean = false;
  private nextPosition: number = 0;

  constructor(initialThreshold: number = 7) {
    if (initialThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = initialThreshold;
    this.lastUpdateTime = Date.now();
    this.nextPosition = 0;
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
    const willAttack = this.position >= this.threshold;
    const willReachThreshold = (this.nextPosition >= this.threshold);
    return this.pendingAttack || willAttack || willReachThreshold;
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

  private checkForAttack(): boolean {
    return this.position >= this.threshold || this.nextPosition >= this.threshold;
  }

  private prepareNextPosition(): void {
    // Calculate where we would move next
    this.nextPosition = this.position + 1;
    
    // Set pending attack if needed
    if (this.checkForAttack()) {
      this.pendingAttack = true;
      this.position = this.threshold; // Force position to threshold for attack
    }
  }

  private handleAttack(): void {
    // Record the attack
    this.attackCount++;
    if (this.isDefended()) {
      this.defenseCount++;
    }

    // Reset state
    this.position = 0;
    this.nextPosition = 0;
    this.knightCount = 0;
    this.pendingAttack = false;
  }

  advancePosition(): void {
    // Phase 1: Prepare next state
    this.prepareNextPosition();

    // Phase 2: Handle attack if needed
    if (this.pendingAttack) {
      this.handleAttack();
    } else {
      // Phase 3: Regular movement
      this.position = this.nextPosition;
    }

    // Phase 4: Update timestamp
    this.lastUpdateTime = Date.now();
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    
    this.threshold = newThreshold;

    // Recalculate position after threshold change
    this.prepareNextPosition();
    if (this.pendingAttack) {
      this.handleAttack();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.nextPosition = 0;
    this.pendingAttack = false;
    this.lastUpdateTime = Date.now();
  }
}