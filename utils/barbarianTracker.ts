  public undo(): boolean {
    if (!this.lastAction) return false;
    
    const { type, previousState } = this.lastAction;
    this.maxProgress = previousState.maxProgress;
    this.currentProgress = previousState.currentProgress;
    this.isAttacking = previousState.isAttacking;
    this.knights = previousState.knights;
    this.attackHistory = [...previousState.attackHistory];
    this.lastAction = undefined;
    
    this.notifyListeners();
    return true;
  }