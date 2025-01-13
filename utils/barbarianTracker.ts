export interface BarbarianState {
  currentProgress: number;
  maxProgress: number;
  isAttacking: boolean;
}

export class BarbarianTracker {
  private currentProgress: number = 0;
  private maxProgress: number;
  private isAttacking: boolean = false;

  constructor(maxProgress: number = 7) {
    if (maxProgress < 1) {
      throw new Error('Max progress must be at least 1');
    }
    this.maxProgress = maxProgress;
  }

  public advance(): boolean {
    if (this.isAttacking) {
      return true;
    }

    this.currentProgress++;
    
    if (this.currentProgress >= this.maxProgress) {
      this.isAttacking = true;
      return true;
    }

    return false;
  }

  public reset(): void {
    this.currentProgress = 0;
    this.isAttacking = false;
  }

  public setMaxProgress(max: number): void {
    if (max < 1) {
      throw new Error('Max progress must be at least 1');
    }
    this.maxProgress = max;
    // Reset if current progress exceeds new max
    if (this.currentProgress >= max) {
      this.reset();
    }
  }

  public getState(): BarbarianState {
    return {
      currentProgress: this.currentProgress,
      maxProgress: this.maxProgress,
      isAttacking: this.isAttacking
    };
  }
}