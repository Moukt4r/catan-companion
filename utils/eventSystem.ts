import { GameEvent, EventType, EventCategory, EventHistoryEntry } from '../types/eventTypes';
import { EVENTS } from './events';

export class EventSystem {
  private eventChance: number;
  private randomFn: () => number;
  private history: EventHistoryEntry[] = [];
  private maxHistorySize: number;
  private activeEvents: GameEvent[] = [];

  constructor(
    eventChance: number = 15, 
    maxHistorySize: number = 10,
    randomFn: () => number = Math.random
  ) {
    if (eventChance < 0 || eventChance > 100) {
      throw new Error('Event chance must be between 0 and 100');
    }
    this.eventChance = eventChance;
    this.maxHistorySize = maxHistorySize;
    this.randomFn = randomFn;
  }

  public checkForEvent(gameState?: {
    cities: number;
    victoryPoints: number;
    developments: number;
  }): GameEvent | null {
    if (this.randomFn() * 100 >= this.eventChance) {
      return null;
    }

    // Filter eligible events based on prerequisites
    const eligibleEvents = EVENTS.filter(event => {
      if (!event.prerequisites) return true;
      if (!gameState) return false;
      
      const { prerequisites } = event;
      return (
        (!prerequisites.cities || gameState.cities >= prerequisites.cities) &&
        (!prerequisites.victoryPoints || gameState.victoryPoints >= prerequisites.victoryPoints) &&
        (!prerequisites.developments || gameState.developments >= prerequisites.developments)
      );
    });

    if (eligibleEvents.length === 0) return null;

    const event = eligibleEvents[Math.floor(this.randomFn() * eligibleEvents.length)];
    this.addToHistory(event);
    
    if (event.duration) {
      this.activeEvents.push(event);
    }
    
    return event;
  }

  private addToHistory(event: GameEvent): void {
    const entry: EventHistoryEntry = {
      event,
      timestamp: Date.now(),
      dismissed: false
    };
    
    this.history.unshift(entry);
    if (this.history.length > this.maxHistorySize) {
      this.history.pop();
    }
  }

  public setEventChance(chance: number): void {
    if (chance < 0 || chance > 100) {
      throw new Error('Event chance must be between 0 and 100');
    }
    this.eventChance = chance;
  }

  public getEventChance(): number {
    return this.eventChance;
  }

  public getHistory(): readonly EventHistoryEntry[] {
    return this.history;
  }

  public getActiveEvents(): readonly GameEvent[] {
    return this.activeEvents;
  }

  public dismissEvent(eventId: string): void {
    const historyEntry = this.history.find(entry => entry.event.id === eventId);
    if (historyEntry) {
      historyEntry.dismissed = true;
    }
  }

  public removeExpiredEvent(eventId: string): void {
    this.activeEvents = this.activeEvents.filter(event => event.id !== eventId);
  }

  public filterEventsByType(type: EventType): GameEvent[] {
    return EVENTS.filter(event => event.type === type);
  }

  public filterEventsByCategory(category: EventCategory): GameEvent[] {
    return EVENTS.filter(event => event.category === category);
  }

  public static getAllEvents(): readonly GameEvent[] {
    return EVENTS;
  }
}