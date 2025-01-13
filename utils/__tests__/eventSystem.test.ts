import { EventSystem } from '../eventSystem';
import { EVENTS } from '../events';

describe('EventSystem', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  describe('constructor', () => {
    it('initializes with default 15% chance', () => {
      expect(eventSystem.getEventChance()).toBe(15);
    });

    it('throws error for invalid chance values', () => {
      expect(() => new EventSystem(-1)).toThrow();
      expect(() => new EventSystem(101)).toThrow();
    });
  });

  describe('event triggering', () => {
    it('triggers events at specified rate', () => {
      const mockRandom = jest.fn()
        .mockReturnValueOnce(0.14) // Should trigger (14% < 15%)
        .mockReturnValueOnce(0.5)  // Pick random event
        .mockReturnValueOnce(0.16) // Should not trigger (16% > 15%)
        .mockReturnValueOnce(0.14) // Should trigger (14% < 15%)
        .mockReturnValueOnce(0.3); // Pick random event

      const system = new EventSystem(15, mockRandom);

      const event1 = system.checkForEvent();
      expect(event1).toBeTruthy();
      
      const event2 = system.checkForEvent();
      expect(event2).toBeNull();
      
      const event3 = system.checkForEvent();
      expect(event3).toBeTruthy();
    });

    it('returns valid events when triggered', () => {
      // Force event to trigger
      const system = new EventSystem(100);
      
      for (let i = 0; i < 50; i++) {
        const event = system.checkForEvent();
        expect(event).toBeTruthy();
        expect(EVENTS).toContain(event);
      }
    });
  });

  describe('event chance modification', () => {
    it('allows changing event chance', () => {
      eventSystem.setEventChance(50);
      expect(eventSystem.getEventChance()).toBe(50);
    });

    it('throws error for invalid chance values', () => {
      expect(() => eventSystem.setEventChance(-1)).toThrow();
      expect(() => eventSystem.setEventChance(101)).toThrow();
    });
  });

  describe('last event tracking', () => {
    it('tracks last triggered event', () => {
      const system = new EventSystem(100); // Always trigger
      
      const event = system.checkForEvent();
      expect(system.getLastEvent()).toBe(event);
    });

    it('maintains null when no event triggered', () => {
      const system = new EventSystem(0); // Never trigger
      
      system.checkForEvent();
      expect(system.getLastEvent()).toBeNull();
    });
  });

  describe('event distribution', () => {
    it('provides uniform distribution of events', () => {
      const system = new EventSystem(100); // Always trigger
      const eventCounts = new Map<string, number>();
      const iterations = 3000;

      for (let i = 0; i < iterations; i++) {
        const event = system.checkForEvent();
        if (event) {
          eventCounts.set(event.id, (eventCounts.get(event.id) || 0) + 1);
        }
      }

      const expectedCount = iterations / EVENTS.length;
      const tolerance = expectedCount * 0.2; // 20% tolerance

      for (const count of eventCounts.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }
    });
  });
});