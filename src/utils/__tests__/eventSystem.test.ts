import { EventSystem, EVENTS } from '../events';

describe('EventSystem', () => {
  let eventSystem: EventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  it('should initialize with default values', () => {
    expect(eventSystem.isEnabled()).toBe(true);
    expect(eventSystem.getChance()).toBe(15);
  });

  it('should validate chance values', () => {
    expect(() => eventSystem.setChance(-1)).toThrow();
    expect(() => eventSystem.setChance(101)).toThrow();
    
    eventSystem.setChance(50);
    expect(eventSystem.getChance()).toBe(50);
  });

  it('should enable/disable event generation', () => {
    eventSystem.disable();
    expect(eventSystem.isEnabled()).toBe(false);
    expect(eventSystem.getRandomEvent()).toBeNull();

    eventSystem.enable();
    expect(eventSystem.isEnabled()).toBe(true);
    expect(eventSystem.getRandomEvent()).toBeDefined();
  });

  it('should fetch events by ID', () => {
    const testEvent = eventSystem.getEventById('test1');
    expect(testEvent).toBeDefined();
    expect(testEvent?.title).toBe('Test Event 1');
    
    const nonExistentEvent = eventSystem.getEventById('nonexistent');
    expect(nonExistentEvent).toBeUndefined();
  });

  it('should respect probability thresholds', () => {
    eventSystem.setChance(0);
    expect(eventSystem.getRandomEvent()).toBeNull();

    eventSystem.setChance(100);
    const event = eventSystem.getRandomEvent();
    expect(event).toBeDefined();
    expect(EVENTS).toContainEqual(event);
  });

  it('should provide deterministic event selection for testing', () => {
    eventSystem.setChance(100);
    const event1 = eventSystem.getRandomEvent();
    const event2 = eventSystem.getRandomEvent();
    expect(event1).toEqual(event2);
  });

  it('should include required event properties', () => {
    eventSystem.setChance(100);
    const event = eventSystem.getRandomEvent();
    expect(event).toMatchObject({
      id: expect.any(String),
      type: expect.stringMatching(/^(positive|negative|neutral)$/),
      title: expect.any(String),
      description: expect.any(String)
    });
  });

  it('should handle event types correctly', () => {
    const types = new Set(EVENTS.map(event => event.type));
    expect(types).toContain('positive');
    expect(types).toContain('negative');
    expect(types).toContain('neutral');
  });

  it('should maintain correct event structure', () => {
    // Test that all events have required properties
    EVENTS.forEach(event => {
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('probability');

      expect(typeof event.id).toBe('string');
      expect(['positive', 'negative', 'neutral']).toContain(event.type);
      expect(typeof event.title).toBe('string');
      expect(typeof event.description).toBe('string');
      expect(typeof event.probability).toBe('number');
    });
  });

  it('should handle edge cases', () => {
    // Test with min chance value
    eventSystem.setChance(1);
    expect(eventSystem.getChance()).toBe(1);

    // Test with max chance value
    eventSystem.setChance(100);
    expect(eventSystem.getChance()).toBe(100);

    // Test toggling enabled state rapidly
    eventSystem.enable();
    eventSystem.disable();
    eventSystem.enable();
    expect(eventSystem.isEnabled()).toBe(true);
  });

  it('should not modify events array externally', () => {
    const initialLength = EVENTS.length;
    const event = eventSystem.getEventById('test1');

    // Try to modify the returned event
    if (event) {
      event.title = 'Modified title';
    }

    // Check that original event is unchanged
    const sameEvent = eventSystem.getEventById('test1');
    expect(sameEvent?.title).toBe('Test Event 1');

    // Check that events array length hasn't changed
    expect(EVENTS.length).toBe(initialLength);
  });

  it('should handle many sequential operations', () => {
    // Perform a sequence of operations
    for (let i = 0; i < 100; i++) {
      eventSystem.setChance(i % 101);
      if (i % 2 === 0) {
        eventSystem.disable();
      } else {
        eventSystem.enable();
      }
      eventSystem.getRandomEvent();
    }

    // System should still be in a valid state
    expect(eventSystem.getChance()).toBeGreaterThanOrEqual(0);
    expect(eventSystem.getChance()).toBeLessThanOrEqual(100);
    expect(typeof eventSystem.isEnabled()).toBe('boolean');
  });

  it('should validate event probabilities', () => {
    // Check that probabilities sum to approximately 1
    const totalProbability = EVENTS.reduce((sum, event) => sum + (event.probability || 0), 0);
    expect(Math.abs(1 - totalProbability)).toBeLessThan(0.01);

    // Check individual probability ranges
    EVENTS.forEach(event => {
      expect(event.probability).toBeGreaterThan(0);
      expect(event.probability).toBeLessThanOrEqual(1);
    });
  });
});
