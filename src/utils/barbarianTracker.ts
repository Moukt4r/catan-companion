export class BarbarianTracker {
  private position: number = 0;
  private knightCount: number = 0;
  private threshold: number;
  private isMoving: boolean = false;
  private attackCount: number = 0;
  private defenseCount: number = 0;
  private lastUpdateTime: number;
  private attackTriggered: boolean = false;

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
    return this.attackTriggered;
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
    const nextPosition = this.position + 1;
    
    if (nextPosition >= this.threshold) {
      this.attackTriggered = true;
      this.attackCount++;
      
      if (this.isDefended()) {
        this.defenseCount++;
      }

      // Reset position and knights but keep attack triggered
      this.position = 0;
      this.knightCount = 0;
    } else {
      this.attackTriggered = false;
      this.position = nextPosition;
    }
    
    this.lastUpdateTime = Date.now();
  }

  setThreshold(newThreshold: number): void {
    if (newThreshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }
    this.threshold = newThreshold;

    // Check if current position would trigger attack with new threshold
    if (this.position >= this.threshold) {
      this.attackTriggered = true;
      this.attackCount++;
      if (this.isDefended()) {
        this.defenseCount++;
      }
      this.position = 0;
      this.knightCount = 0;
      this.lastUpdateTime = Date.now();
    }
  }

  resetPosition(): void {
    this.position = 0;
    this.attackTriggered = false;
    this.lastUpdateTime = Date.now();
  }
}