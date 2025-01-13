export interface BarbarianState {
  currentProgress: number;
  maxProgress: number;
  isAttacking: boolean;
  knights: number;
  attackHistory: Array<{
    timestamp: number;
    knightsAtAttack: number;
  }>;
  lastAction?: {
    type: 'advance' | 'reset' | 'setMax';
    previousState: Omit<BarbarianState, 'lastAction'>;
  };
}

type StateChangeCallback = (state: BarbarianState) => void;

export class BarbarianTracker {
  private currentProgress: number = 0;
  private maxProgress: number;
  private isAttacking: boolean = false;
  private knights: number = 0;
  private attackHistory: BarbarianState['attackHistory'] = [];
  private listeners: Set<StateChangeCallback> = new Set();
  private lastAction?: BarbarianState['lastAction'];

  constructor(maxProgress: number = 7) {
    if (maxProgress < 1) {
      throw new Error('Max progress must be at least 1');
    }
    this.maxProgress = maxProgress;
  }

  public subscribe(callback: StateChangeCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  private saveLastAction(type: BarbarianState['lastAction']['type']): void {
    const { lastAction, ...currentState } = this.getState();
    this.lastAction = { type, previousState: currentState };
  }

  public advance(): boolean {
    this.saveLastAction('advance');

    if (this.isAttacking) {
      return true;
    }

    this.currentProgress++;
    
    if (this.currentProgress >= this.maxProgress) {
      this.isAttacking = true;
      this.attackHistory.push({
        timestamp: Date.now(),
        knightsAtAttack: this.knights
      });
      this.notifyListeners();
      return true;
    }

    this.notifyListeners();
    return false;
  }

  public reset(): void {
    this.saveLastAction('reset');
    this.currentProgress = 0;
    this.isAttacking = false;
    this.notifyListeners();
  }

  public undo(): boolean {
    if (!this.lastAction) return false;

    const { type, previousState } = this.lastAction;
    Object.assign(this, previousState);
    this.lastAction = undefined;
    this.notifyListeners();
    return true;
  }

  public setMaxProgress(max: number): void {
    if (max < 1) {
      throw new Error('Max progress must be at least 1');
    }
    this.saveLastAction('setMax');
    this.maxProgress = max;
    if (this.currentProgress >= max) {
      this.reset();
    } else {
      this.notifyListeners();
    }
  }

  public setKnights(count: number): void {
    if (count < 0) {
      throw new Error('Knight count cannot be negative');
    }
    this.knights = count;
    this.notifyListeners();
  }

  public getStepsUntilAttack(): number {
    return this.isAttacking ? 0 : this.maxProgress - this.currentProgress;
  }

  public getAttackCount(): number {
    return this.attackHistory.length;
  }

  public getState(): BarbarianState {
    return {
      currentProgress: this.currentProgress,
      maxProgress: this.maxProgress,
      isAttacking: this.isAttacking,
      knights: this.knights,
      attackHistory: [...this.attackHistory],
      lastAction: this.lastAction
    };
  }

  public loadState(state: Partial<BarbarianState>): void {
    if (state.maxProgress && state.maxProgress >= 1) {
      this.maxProgress = state.maxProgress;
    }
    if (typeof state.currentProgress === 'number') {
      this.currentProgress = state.currentProgress;
    }
    if (typeof state.isAttacking === 'boolean') {
      this.isAttacking = state.isAttacking;
    }
    if (typeof state.knights === 'number' && state.knights >= 0) {
      this.knights = state.knights;
    }
    if (Array.isArray(state.attackHistory)) {
      this.attackHistory = state.attackHistory;
    }
    this.notifyListeners();
  }
}