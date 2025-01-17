import { EventSystem } from '../eventSystem';

// Mock the game events so we can have predictable test results
jest.mock('../events', () => ({
  EVENTS: [
    {
      id: 'test1',
      type: 'positive',
      category: 'resource',
      severity: 'low',
      prerequisites: {
        cities: 1
      }
    },
    {
      id: 'test2',
      type: 'negative',
      category: 'resource',
      severity: 'high',
      prerequisites: {
        cities: 3
      }
    },
    {
      id: 'test3',
      type: 'neutral',
      category: 'development',
      severity: 'medium'
    }
  ]
}));

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

    it('returns null when no events match prerequisites', () => {
      const mockGameState = {
        cities: 0,
        victoryPoints: 0,
        developments: 0
      };

      const mockRandom = jest.fn()
        .mockReturnValue(0.1);  // Always trigger, but no events should match prereqs

      const system = new EventSystem(100, mockRandom);
      const event = system.checkForEvent(mockGameState);
      expect(event?.id).toBe('test3'); // Should only get the event without prerequisites
    });

    it('validates event chance range', () => {
      expect(() => new EventSystem(-1)).toThrow();
      expect(() => new EventSystem(101)).toThrow();
    });
  });

  describe('event distribution', () => {
    it('provides reasonably uniform distribution of events', () => {
      // Force events to always trigger with deterministic selection
      let currentIndex = 0;
      const mockRandom = jest.fn().mockImplementation(() => currentIndex++ % 3 / 3);
      
      const system = new EventSystem(100, mockRandom);
      const eventCounts = new Map<string, number>();
      const iterations = 300;  // Should get 100 of each event

      for (let i = 0; i < iterations; i++) {
        const event = system.checkForEvent();
        if (event) {
          eventCounts.set(event.id, (eventCounts.get(event.id) || 0) + 1);
        }
      }

      // Each event should appear about the same number of times
      const expectedCount = iterations / 3;  // 3 test events
      const tolerance = expectedCount * 0.3;  // 30% tolerance

      for (const count of eventCounts.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }

      // Verify we got all events
      expect(eventCounts.size).toBe(3);
    });
  });

  describe('prerequisites handling', () => {
    it('filters events based on prerequisites correctly', () => {
      const mockGameState = {
        cities: 2,
        victoryPoints: 5,
        developments: 3
      };

      // Force first event selection
      const mockRandom = jest.fn().mockReturnValue(0);
      const system = new EventSystem(100, mockRandom);
      
      const event = system.checkForEvent(mockGameState);
      expect(event?.id).toBe('test1');  // Only test1 should match (requires 1 city)
    });

    it('handles events without prerequisites', () => {
      const gameState = {
        cities: 0,
        victoryPoints: 0,
        developments: 0
      };

      // Force selection of last event (test3)
      const mockRandom = jest.fn()
        .mockReturnValueOnce(0.1)  // Trigger event
        .mockReturnValueOnce(0.8); // Select last event
        
      const system = new EventSystem(100, mockRandom);
      const event = system.checkForEvent(gameState);
      
      expect(event?.id).toBe('test3');
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

  describe('event chance management', () => {
    it('gets and sets event chance correctly', () => {
      const newChance = 50;
      system.setEventChance(newChance);
      expect(system.getEventChance()).toBe(newChance);
    });

    it('throws on invalid event chance', () => {
      expect(() => system.setEventChance(-1)).toThrow();
      expect(() => system.setEventChance(101)).toThrow();
    });
  });
});