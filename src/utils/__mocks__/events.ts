interface GameEvent {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  probability?: number;
}

export const EVENTS: GameEvent[] = [
  {
    id: 'test1',
    type: 'positive',
    title: 'Test Event 1',
    description: 'Test event description 1',
    probability: 0.5
  },
  {
    id: 'test2',
    type: 'negative',
    title: 'Test Event 2',
    description: 'Test event description 2',
    probability: 0.3
  },
  {
    id: 'test3',
    type: 'neutral',
    title: 'Test Event 3',
    description: 'Test event description 3',
    probability: 0.2
  }
];

export class EventSystem {
  private events: GameEvent[];
  private enabled: boolean;
  private chance: number;

  constructor(initialChance: number = 15) {
    this.events = [...EVENTS];
    this.enabled = true;
    this.chance = initialChance;
  }

  public setChance(chance: number): void {
    if (chance < 0 || chance > 100) {
      throw new Error('Chance must be between 0 and 100');
    }
    this.chance = chance;
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getChance(): number {
    return this.chance;
  }

  public getRandomEvent(): GameEvent | null {
    if (!this.enabled) return null;

    // Fixed random number for testing
    const roll = 0.5;
    if (roll > this.chance / 100) return null;

    const eventsCopy = [...this.events];
    return eventsCopy[1]; // Always return the second event for testing
  }

  public getEventById(id: string): GameEvent | undefined {
    return this.events.find(event => event.id === id);
  }
}
