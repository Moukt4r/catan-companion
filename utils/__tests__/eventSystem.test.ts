import { EventSystem } from '../eventSystem';

describe('EventSystem', () => {
  let system: EventSystem;

  beforeEach(() => {
    system = new EventSystem();
  });

  describe('event triggering', () => {
    it('triggers events at specified rate', () => {
      const mockRandom = jest.fn()
        .mockReturnValueOnce(0.1)  // 10% - should trigger (for check)
        .mockReturnValueOnce(0.5)  // for event selection
        .mockReturnValueOnce(0.2)  // 20% - should not trigger
        .mockReturnValueOnce(0.1); // for next event selection

      const system = new EventSystem(15, mockRandom);
      
      const event1 = system.checkForEvent();
      expect(event1).toBeTruthy();
      
      const event2 = system.checkForEvent();
      expect(event2).toBeNull();
    });
  });

  describe('event distribution', () => {
    it('provides uniform distribution of events', () => {
      // Force events to always trigger
      const system = new EventSystem(100);
      const eventCounts = new Map<string, number>();
      const iterations = 6000;  // More iterations for better distribution

      for (let i = 0; i < iterations; i++) {
        const event = system.checkForEvent();
        if (event) {
          eventCounts.set(event.id, (eventCounts.get(event.id) || 0) + 1);
        }
      }

      const expectedCount = iterations / eventCounts.size;
      const tolerance = expectedCount * 0.2;  // 20% tolerance

      for (const count of eventCounts.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }
    });
  });

  describe('last event tracking', () => {
    it('tracks last triggered event', () => {
      system.setEventChance(100);  // Always trigger
      const event = system.checkForEvent();
      expect(system.getLastEvent()).toBe(event);
    });

    it('maintains null when no event triggered', () => {
      system.setEventChance(0);  // Never trigger
      system.checkForEvent();
      expect(system.getLastEvent()).toBeNull();
    });
  });
});