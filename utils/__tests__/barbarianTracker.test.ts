import { BarbarianTracker } from '../barbarianTracker';

describe('BarbarianTracker', () => {
  let tracker: BarbarianTracker;

  beforeEach(() => {
    tracker = new BarbarianTracker();
  });

  describe('initialization', () => {
    it('starts with zero progress', () => {
      const state = tracker.getState();
      expect(state.currentProgress).toBe(0);
      expect(state.isAttacking).toBe(false);
    });

    it('uses default max progress of 7', () => {
      const state = tracker.getState();
      expect(state.maxProgress).toBe(7);
    });

    it('accepts custom max progress', () => {
      const customTracker = new BarbarianTracker(5);
      const state = customTracker.getState();
      expect(state.maxProgress).toBe(5);
    });

    it('throws error for invalid max progress', () => {
      expect(() => new BarbarianTracker(0)).toThrow();
      expect(() => new BarbarianTracker(-1)).toThrow();
    });
  });

  describe('progress tracking', () => {
    it('advances progress by one', () => {
      tracker.advance();
      const state = tracker.getState();
      expect(state.currentProgress).toBe(1);
    });

    it('triggers attack at max progress', () => {
      // Advance to just before max
      for (let i = 0; i < 6; i++) {
        const result = tracker.advance();
        expect(result).toBe(false);
      }

      // Next advance should trigger attack
      const result = tracker.advance();
      expect(result).toBe(true);

      const state = tracker.getState();
      expect(state.isAttacking).toBe(true);
    });

    it('maintains attack state until reset', () => {
      // Advance to attack
      for (let i = 0; i < 7; i++) {
        tracker.advance();
      }

      // Additional advances should maintain attack state
      tracker.advance();
      tracker.advance();

      const state = tracker.getState();
      expect(state.isAttacking).toBe(true);
    });
  });

  describe('reset functionality', () => {
    it('resets progress and attack state', () => {
      // Advance to attack
      for (let i = 0; i < 7; i++) {
        tracker.advance();
      }

      tracker.reset();
      const state = tracker.getState();
      expect(state.currentProgress).toBe(0);
      expect(state.isAttacking).toBe(false);
    });
  });

  describe('max progress modification', () => {
    it('allows changing max progress', () => {
      tracker.setMaxProgress(5);
      const state = tracker.getState();
      expect(state.maxProgress).toBe(5);
    });

    it('resets progress if current exceeds new max', () => {
      // Advance to 4
      for (let i = 0; i < 4; i++) {
        tracker.advance();
      }

      tracker.setMaxProgress(3);
      const state = tracker.getState();
      expect(state.currentProgress).toBe(0);
    });

    it('throws error for invalid max progress', () => {
      expect(() => tracker.setMaxProgress(0)).toThrow();
      expect(() => tracker.setMaxProgress(-1)).toThrow();
    });
  });
});