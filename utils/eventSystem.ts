import { GameEvent } from '../types/eventTypes';
import { EVENTS } from './events';

export class EventSystem {
  private eventChance: number;
  private randomFn: () => number;
  private events: GameEvent[];
  private lastEvent: GameEvent | null = null;

  constructor(
    eventChance: number = 15,
    randomFn: () => number = Math.random
  ) {
    if (eventChance < 0 || eventChance > 100) {
      throw new Error('Event chance must be between 0 and 100');
    }
    this.eventChance = eventChance;
    this.randomFn = randomFn;
    this.events = [...EVENTS];
  }

  public checkForEvent(gameState?: {
    cities: number;
    victoryPoints: number;
    developments: number;
  }): GameEvent | null {
    // First roll for event chance
    if (this.randomFn() * 100 >= this.eventChance) {
      return null;
    }

    // Filter eligible events based on prerequisites
    const eligibleEvents = gameState
      ? this.events.filter(event => {
          if (!event.prerequisites) return true;
          const { prerequisites } = event;
          return (
            (!prerequisites.cities || gameState.cities >= prerequisites.cities) &&
            (!prerequisites.victoryPoints || gameState.victoryPoints >= prerequisites.victoryPoints) &&
            (!prerequisites.developments || gameState.developments >= prerequisites.developments)
          );
        })
      : this.events;

    if (eligibleEvents.length === 0) return null;

    // Select random event
    const event = eligibleEvents[Math.floor(this.randomFn() * eligibleEvents.length)];
    this.lastEvent = event;
    return event;
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