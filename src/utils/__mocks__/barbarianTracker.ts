interface BarbarianState {
  knightCount: number;
  barbarianProgress: number;
  isMoving: boolean;
  attackCount: number;
  defenseCount: number;
  threshold: number;
  lastUpdateTime: number;
}

export class BarbarianTracker {
  private state: BarbarianState;

  constructor(threshold: number = 7) {
    this.state = {
      knightCount: 0,
      barbarianProgress: 0,
      isMoving: false,
      attackCount: 0,
      defenseCount: 0,
      threshold,
      lastUpdateTime: Date.now()
    };
  }

  public incrementKnights(): void {
    this.state.knightCount++;
  }

  public decrementKnights(): void {
    if (this.state.knightCount > 0) {
      this.state.knightCount--;
    }
  }

  public advancePosition(): void {
    if (this.state.barbarianProgress < this.state.threshold) {
      this.state.barbarianProgress++;
      this.state.lastUpdateTime = Date.now();
      this.checkForAttack();
    }
  }

  public resetPosition(): void {
    this.state.barbarianProgress = 0;
    this.state.lastUpdateTime = Date.now();
  }

  public getKnightCount(): number {
    return this.state.knightCount;
  }

  public getPosition(): number {
    return this.state.barbarianProgress;
  }

  public getThreshold(): number {
    return this.state.threshold;
  }

  public setThreshold(threshold: number): void {
    if (threshold < 1) {
      throw new Error('Threshold must be at least 1');
    }
    this.state.threshold = threshold;
  }

  public getAttackCount(): number {
    return this.state.attackCount;
  }

  public getDefenseCount(): number {
    return this.state.defenseCount;
  }

  public getLastUpdateTime(): number {
    return this.state.lastUpdateTime;
  }

  public isBarbarianMoving(): boolean {
    return this.state.isMoving;
  }

  public isUnderAttack(): boolean {
    return this.state.barbarianProgress >= this.state.threshold;
  }

  public startMove(): void {
    this.state.isMoving = true;
  }

  public endMove(): void {
    this.state.isMoving = false;
  }

  public isDefended(): boolean {
    return this.state.knightCount >= 3;
  }

  public checkForAttack(): void {
    if (this.isUnderAttack()) {
      this.state.attackCount++;
      if (this.isDefended()) {
        this.state.defenseCount++;
      }
      this.state.barbarianProgress = 0;
      this.state.knightCount = 0;
      this.state.lastUpdateTime = Date.now();
    }
  }

  public getDefenseNeeded(): number {
    return Math.max(0, 3 - this.state.knightCount);
  }
}
