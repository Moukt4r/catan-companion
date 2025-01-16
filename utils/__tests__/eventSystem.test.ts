import { EventSystem } from '../eventSystem';
import { EVENTS } from '../events';

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

    it('handles invalid event chances correctly', () => {
      expect(() => new EventSystem(-1)).toThrow('Event chance must be between 0 and 100');
      expect(() => new EventSystem(101)).toThrow('Event chance must be between 0 and 100');
      expect(() => system.setEventChance(-1)).toThrow('Event chance must be between 0 and 100');
      expect(() => system.setEventChance(101)).toThrow('Event chance must be between 0 and 100');
    });

    it('returns null when no events match prerequisites', () => {
      const mockGameState = {
        cities: 0,
        victoryPoints: 0,
        developments: 0
      };

      // Mock an event that requires impossible prerequisites
      const mockEvents = [{
        id: 'test',
        type: 'positive' as const,
        category: 'resource' as const,
        severity: 'low',
        prerequisites: {
          cities: 999,
          victoryPoints: 999,
          developments: 999
        }
      }];

      jest.spyOn(EventSystem, 'getAllEvents').mockReturnValue(mockEvents);
      
      system.setEventChance(100); // Always trigger
      const event = system.checkForEvent(mockGameState);
      expect(event).toBeNull();
    });
  });

  describe('event distribution', () => {
    it('provides reasonably uniform distribution of events', () => {
      // Force events to always trigger
      const system = new EventSystem(100);
      const eventCounts = new Map<string, number>();
      const iterations = 10000;  // More iterations for better distribution

      for (let i = 0; i < iterations; i++) {
        const event = system.checkForEvent();
        if (event) {
          eventCounts.set(event.id, (eventCounts.get(event.id) || 0) + 1);
        }
      }

      const expectedCount = iterations / EVENTS.length;
      const tolerance = expectedCount * 0.3;  // 30% tolerance

      for (const count of eventCounts.values()) {
        expect(Math.abs(count - expectedCount)).toBeLessThan(tolerance);
      }

      // Check if we got all possible events
      expect(eventCounts.size).toBe(EVENTS.length);
    });
  });

  describe('prerequisites handling', () => {
    it('filters events based on prerequisites correctly', () => {
      const mockGameState = {
        cities: 2,
        victoryPoints: 5,
        developments: 3
      };

      // Mock specific events to test prerequisites
      const mockEvents = [
        {
          id: 'test1',
          type: 'positive' as const,
          category: 'resource' as const,
          severity: 'low',
          prerequisites: {
            cities: 1
          }
        },
        {
          id: 'test2',
          type: 'negative' as const,
          category: 'resource' as const,
          severity: 'high',
          prerequisites: {
            cities: 3  // Higher than mockGameState
          }
        }
      ];

      jest.spyOn(EventSystem, 'getAllEvents').mockReturnValue(mockEvents);
      
      // Use deterministic random function to always select first eligible event
      const system = new EventSystem(100, () => 0);
      
      const event = system.checkForEvent(mockGameState);
      expect(event?.id).toBe('test1');
    });

    it('handles events without prerequisites', () => {
      const mockEvents = [
        {
          id: 'test-no-prereq',
          type: 'positive' as const,
          category: 'resource' as const,
          severity: 'low'
        }
      ];

      jest.spyOn(EventSystem, 'getAllEvents').mockReturnValue(mockEvents);
      
      system.setEventChance(100); // Always trigger
      const event = system.checkForEvent({
        cities: 0,
        victoryPoints: 0,
        developments: 0
      });
      
      expect(event?.id).toBe('test-no-prereq');
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
      system.setEventChance(50);
      expect(system.getEventChance()).toBe(50);
    });
  });
});