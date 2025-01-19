import { EventSystem, EVENTS } from '../events';

describe('EventSystem', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
    jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('starts enabled by default', () => {
      expect(eventSystem.isEnabled()).toBe(true);
    });

    it('has default chance of 15%', () => {
      expect(eventSystem.getChance()).toBe(15);
    });
  });

  describe('basic operations', () => {
    it('can be enabled and disabled', () => {
      eventSystem.disable();
      expect(eventSystem.isEnabled()).toBe(false);
      
      eventSystem.enable();
      expect(eventSystem.isEnabled()).toBe(true);
    });

    it('validates chance values', () => {
      expect(() => eventSystem.setChance(-1)).toThrow();
      expect(() => eventSystem.setChance(101)).toThrow();
      expect(() => eventSystem.setChance(50)).not.toThrow();
      expect(eventSystem.getChance()).toBe(50);
    });
  });

  describe('event generation', () => {
    it('returns null when disabled', () => {
      eventSystem.disable();
      expect(eventSystem.getRandomEvent()).toBeNull();
    });

    it('returns first event when chance is 100%', () => {
      eventSystem.setChance(100);
      const event = eventSystem.getRandomEvent();
      expect(event).toEqual(expect.objectContaining(EVENTS[0]));
    });

    it('returns null when roll is above chance', () => {
      (Math.random as jest.Mock).mockReturnValueOnce(0.9); // 90% roll
      eventSystem.setChance(15); // 15% chance
      expect(eventSystem.getRandomEvent()).toBeNull();
    });

    it('returns event based on cumulative probability', () => {
      // First random is for the initial chance check (needs to be within event chance)
      (Math.random as jest.Mock).mockReturnValueOnce(0.1); // 10% roll (passes 15% chance check)
      // Second random is for event selection
      (Math.random as jest.Mock).mockReturnValueOnce(0.3); // Should select second event

      const event = eventSystem.getRandomEvent();
      expect(event).toEqual(expect.objectContaining(EVENTS[1]));
    });

    it('handles case when roll is above all cumulative probabilities', () => {
      // First random passes chance check
      (Math.random as jest.Mock).mockReturnValueOnce(0.1);
      // Second random is above all cumulative probabilities (total is 1.0)
      (Math.random as jest.Mock).mockReturnValueOnce(1.1);

      expect(eventSystem.getRandomEvent()).toBeNull();
    });

    it('returns a copy of the event object', () => {
      eventSystem.setChance(100); // Always get first event
      const event1 = eventSystem.getRandomEvent();
      const event2 = eventSystem.getRandomEvent();
      
      expect(event1).toEqual(event2);
      expect(event1).not.toBe(event2); // Different object references
    });

    it('properly distributes events based on probability', () => {
      // Mock to always pass initial chance check
      (Math.random as jest.Mock).mockReturnValueOnce(0.1);
      (Math.random as jest.Mock).mockReturnValueOnce(0.19); // Just under 0.2
      let event = eventSystem.getRandomEvent();
      expect(event).toEqual(expect.objectContaining(EVENTS[0]));

      (Math.random as jest.Mock).mockReturnValueOnce(0.1);
      (Math.random as jest.Mock).mockReturnValueOnce(0.39); // Just under 0.4
      event = eventSystem.getRandomEvent();
      expect(event).toEqual(expect.objectContaining(EVENTS[1]));

      (Math.random as jest.Mock).mockReturnValueOnce(0.1);
      (Math.random as jest.Mock).mockReturnValueOnce(0.59); // Just under 0.6
      event = eventSystem.getRandomEvent();
      expect(event).toEqual(expect.objectContaining(EVENTS[2]));
    });
  });

  describe('event lookup', () => {
    it('finds event by ID', () => {
      const event = eventSystem.getEventById('test1');
      expect(event).toEqual(expect.objectContaining(EVENTS[0]));
    });

    it('returns undefined for non-existent ID', () => {
      const event = eventSystem.getEventById('nonexistent');
      expect(event).toBeUndefined();
    });

    it('returns a copy of the event object', () => {
      const event1 = eventSystem.getEventById('test1');
      const event2 = eventSystem.getEventById('test1');
      
      expect(event1).toEqual(event2);
      expect(event1).not.toBe(event2); // Different object references
    });
  });
});