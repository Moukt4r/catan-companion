import { BarbarianTracker } from '../barbarianTracker';

describe('BarbarianTracker', () => {
  let tracker: BarbarianTracker;

  beforeEach(() => {
    tracker = new BarbarianTracker();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    expect(tracker.getKnightCount()).toBe(0);
    expect(tracker.getPosition()).toBe(0);
    expect(tracker.getThreshold()).toBe(7);
    expect(tracker.getAttackCount()).toBe(0);
    expect(tracker.getDefenseCount()).toBe(0);
    expect(tracker.isBarbarianMoving()).toBe(false);
  });

  it('should handle knight management', () => {
    tracker.incrementKnights();
    expect(tracker.getKnightCount()).toBe(1);

    tracker.incrementKnights();
    expect(tracker.getKnightCount()).toBe(2);

    tracker.decrementKnights();
    expect(tracker.getKnightCount()).toBe(1);

    // Should not go below 0
    tracker.decrementKnights();
    tracker.decrementKnights();
    expect(tracker.getKnightCount()).toBe(0);
  });

  it('should track barbarian movement', () => {
    tracker.startMove();
    expect(tracker.isBarbarianMoving()).toBe(true);

    tracker.endMove();
    expect(tracker.isBarbarianMoving()).toBe(false);
  });

  it('should handle position advancement', () => {
    // Move barbarian towards settlement
    for (let i = 0; i < 3; i++) {
      tracker.advancePosition();
    }

    expect(tracker.getPosition()).toBe(3);
    expect(tracker.getLastUpdateTime()).toBeLessThanOrEqual(Date.now());
    expect(tracker.isUnderAttack()).toBe(false);
  });

  it('should trigger attack at threshold', () => {
    // Move to threshold
    for (let i = 0; i < 7; i++) {
      tracker.advancePosition();
    }

    expect(tracker.isUnderAttack()).toBe(true);
    expect(tracker.getAttackCount()).toBe(1);
    expect(tracker.getPosition()).toBe(0); // Should reset after attack
    expect(tracker.getKnightCount()).toBe(0); // Knights should be reset
  });

  it('should handle successful defense', () => {
    // Prepare defense
    for (let i = 0; i < 3; i++) {
      tracker.incrementKnights();
    }

    expect(tracker.isDefended()).toBe(true);

    // Trigger attack
    for (let i = 0; i < 7; i++) {
      tracker.advancePosition();
    }

    expect(tracker.getAttackCount()).toBe(1);
    expect(tracker.getDefenseCount()).toBe(1);
  });

  it('should calculate defense needed', () => {
    expect(tracker.getDefenseNeeded()).toBe(3);

    tracker.incrementKnights();
    expect(tracker.getDefenseNeeded()).toBe(2);

    tracker.incrementKnights();
    expect(tracker.getDefenseNeeded()).toBe(1);

    tracker.incrementKnights();
    expect(tracker.getDefenseNeeded()).toBe(0);

    tracker.incrementKnights();
    expect(tracker.getDefenseNeeded()).toBe(0); // Should not go below 0
  });

  it('should allow threshold configuration', () => {
    const customTracker = new BarbarianTracker(5);
    expect(customTracker.getThreshold()).toBe(5);

    customTracker.setThreshold(10);
    expect(customTracker.getThreshold()).toBe(10);

    expect(() => customTracker.setThreshold(0)).toThrow();
    expect(() => customTracker.setThreshold(-1)).toThrow();
  });

  it('should reset position on demand', () => {
    // Advance position
    for (let i = 0; i < 3; i++) {
      tracker.advancePosition();
    }
    expect(tracker.getPosition()).toBe(3);

    // Reset position
    tracker.resetPosition();
    expect(tracker.getPosition()).toBe(0);
    expect(tracker.getLastUpdateTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should not advance beyond threshold and correctly track partial movement', () => {
    // Move to and past threshold
    for (let i = 0; i < 10; i++) {
      tracker.advancePosition();
    }

    expect(tracker.getPosition()).toBe(3); // After hitting threshold at 7, moved 3 more times
    expect(tracker.getAttackCount()).toBe(1); // Only one attack when reaching threshold
    expect(tracker.isUnderAttack()).toBe(false); // Not under attack since not at threshold
  });

  it('should correctly track attack and defense history', () => {
    // First attack - undefended
    for (let i = 0; i < 7; i++) {
      tracker.advancePosition();
    }
    expect(tracker.getAttackCount()).toBe(1);
    expect(tracker.getDefenseCount()).toBe(0);

    // Second attack - partially defended (2 knights)
    tracker.incrementKnights();
    tracker.incrementKnights();
    for (let i = 0; i < 7; i++) {
      tracker.advancePosition();
    }
    expect(tracker.getAttackCount()).toBe(2);
    expect(tracker.getDefenseCount()).toBe(0);

    // Third attack - fully defended (3 knights)
    tracker.incrementKnights();
    tracker.incrementKnights();
    tracker.incrementKnights();
    for (let i = 0; i < 7; i++) {
      tracker.advancePosition();
    }
    expect(tracker.getAttackCount()).toBe(3);
    expect(tracker.getDefenseCount()).toBe(1);
  });

  it('should handle rapid threshold changes', () => {
    // Change threshold rapidly while barbarian is moving
    tracker.startMove();
    tracker.advancePosition();
    tracker.setThreshold(5);
    tracker.advancePosition();
    tracker.setThreshold(10);
    tracker.advancePosition();
    
    expect(tracker.getPosition()).toBe(3);
    expect(tracker.getThreshold()).toBe(10);
    expect(tracker.isBarbarianMoving()).toBe(true);
  });

  it('should handle state changes during movement', () => {
    tracker.startMove();
    
    // Add knights during movement
    tracker.incrementKnights();
    tracker.advancePosition();
    expect(tracker.getKnightCount()).toBe(1);
    expect(tracker.getPosition()).toBe(1);
    
    // Remove knights during movement
    tracker.decrementKnights();
    tracker.advancePosition();
    expect(tracker.getKnightCount()).toBe(0);
    expect(tracker.getPosition()).toBe(2);
    
    tracker.endMove();
    expect(tracker.isBarbarianMoving()).toBe(false);
  });

  it('should maintain time tracking accuracy', () => {
    const startTime = tracker.getLastUpdateTime();
    
    // Simulate time passing
    jest.advanceTimersByTime(1000);
    tracker.advancePosition();
    
    const afterAdvanceTime = tracker.getLastUpdateTime();
    expect(afterAdvanceTime).toBeGreaterThan(startTime);
    
    jest.advanceTimersByTime(1000);
    tracker.resetPosition();
    
    const afterResetTime = tracker.getLastUpdateTime();
    expect(afterResetTime).toBeGreaterThan(afterAdvanceTime);
  });
});