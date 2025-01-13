import { GameEvent, EVENTS } from './events';

export class EventSystem {
  private eventChance: number;
  private randomFn: () => number;
  private lastEvent: GameEvent | null = null;

  constructor(eventChance: number = 15, randomFn: () => number = Math.random) {
    if (eventChance < 0 || eventChance > 100) {
      throw new Error('Event chance must be between 0 and 100');
    }
    this.eventChance = eventChance;
    this.randomFn = randomFn;
  }

  public checkForEvent(): GameEvent | null {
    if (this.randomFn() * 100 < this.eventChance) {
      const event = EVENTS[Math.floor(this.randomFn() * EVENTS.length)];
      this.lastEvent = event;
      return event;
    }
    return null;
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

  public getLastEvent(): GameEvent | null {
    return this.lastEvent;
  }

  public static getAllEvents(): readonly GameEvent[] {
    return EVENTS;
  }
}