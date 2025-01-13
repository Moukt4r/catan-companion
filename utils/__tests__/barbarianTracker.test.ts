import { BarbarianTracker } from '../barbarianTracker';

describe('BarbarianTracker', () => {
  let tracker: BarbarianTracker;

  beforeEach(() => {
    tracker = new BarbarianTracker();
  });

  describe('event emission', () => {
    it('notifies subscribers of state changes', done => {
      const callback = jest.fn();
      tracker.subscribe(callback);
      
      tracker.advance();
      
      // Use setTimeout to handle async notification
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(expect.objectContaining({
          currentProgress: 1
        }));
        done();
      });
    });

    it('allows unsubscribing from events', () => {
      const callback = jest.fn();
      const unsubscribe = tracker.subscribe(callback);
      
      unsubscribe();
      tracker.advance();
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('state persistence', () => {
    it('saves and loads state correctly', () => {
      tracker.advance();
      tracker.setKnights(3);
      
      const state = tracker.getState();
      const newTracker = new BarbarianTracker();
      newTracker.loadState(state);
      
      expect(newTracker.getState()).toEqual(state);
    });

    it('validates loaded state', () => {
      expect(() => tracker.loadState({ maxProgress: 0 })).not.toThrow();
      expect(tracker.getState().maxProgress).toBe(7); // Keeps original value
      
      expect(() => tracker.loadState({ knights: -1 })).not.toThrow();
      expect(tracker.getState().knights).toBe(0); // Keeps original value
    });
  });

  describe('undo functionality', () => {
    it('can undo advance action', () => {
      tracker.advance();
      const stateBeforeUndo = tracker.getState();
      
      tracker.undo();
      expect(tracker.getState().currentProgress).toBe(0);
      
      // Can't undo twice
      tracker.undo();
      expect(tracker.getState().currentProgress).toBe(0);
    });

    it('can undo reset action', () => {
      tracker.advance();
      tracker.advance();
      tracker.reset();
      
      tracker.undo();
      expect(tracker.getState().currentProgress).toBe(2);
    });
  });

  describe('knight management', () => {
    it('tracks knight count', () => {
      tracker.setKnights(3);
      expect(tracker.getState().knights).toBe(3);
    });

    it('prevents negative knight count', () => {
      expect(() => tracker.setKnights(-1)).toThrow();
    });

    it('records knights at attack time', () => {
      tracker.setKnights(3);
      for (let i = 0; i < 7; i++) {
        tracker.advance();
      }
      
      const { attackHistory } = tracker.getState();
      expect(attackHistory[0].knightsAtAttack).toBe(3);
    });
  });

  describe('statistics tracking', () => {
    it('maintains attack history', () => {
      tracker.setKnights(2);
      for (let i = 0; i < 7; i++) tracker.advance();
      tracker.reset();
      
      tracker.setKnights(3);
      for (let i = 0; i < 7; i++) tracker.advance();
      
      const { attackHistory } = tracker.getState();
      expect(attackHistory).toHaveLength(2);
      expect(attackHistory[0].knightsAtAttack).toBe(2);
      expect(attackHistory[1].knightsAtAttack).toBe(3);
    });
  });
});