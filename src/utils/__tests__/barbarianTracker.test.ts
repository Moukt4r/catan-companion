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

  // ... other tests ...

  it('should not advance beyond threshold', () => {
    // Set threshold to 3 to make the test clearer
    tracker.setThreshold(3);
    
    // Move to and past threshold
    for (let i = 0; i < 10; i++) {
      tracker.advancePosition();
    }

    expect(tracker.getPosition()).toBe(0);
    expect(tracker.getAttackCount()).toBe(3); // Three attacks happened (at positions 3, 6, 9)
    expect(tracker.isUnderAttack()).toBe(true); // Should be under attack after last advance
  });
});