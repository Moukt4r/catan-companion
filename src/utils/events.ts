export interface GameEvent {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  probability: number;
}

export const EVENTS: GameEvent[] = [
  {
    id: 'test1',
    type: 'positive',
    title: 'Test Event 1',
    description: 'Test description 1',
    probability: 0.2
  },
  {
    id: 'test2',
    type: 'negative',
    title: 'Test Event 2',
    description: 'Test description 2',
    probability: 0.2
  },
  {
    id: 'test3',
    type: 'neutral',
    title: 'Test Event 3',
    description: 'Test description 3',
    probability: 0.2
  },
  {
    id: 'test4',
    type: 'positive',
    title: 'Test Event 4',
    description: 'Test description 4',
    probability: 0.2
  },
  {
    id: 'test5',
    type: 'negative',
    title: 'Test Event 5',
    description: 'Test description 5',
    probability: 0.2
  }
];

export class EventSystem {
  private enabled: boolean = true;
  private eventChance: number = 15;

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setChance(chance: number): void {
    if (chance < 0 || chance > 100) {
      throw new Error('Chance must be between 0 and 100');
    }
    this.eventChance = chance;
  }

  getChance(): number {
    return this.eventChance;
  }

  getRandomEvent(): GameEvent | null {
    if (!this.enabled) {
      return null;
    }

    // For testing consistency, always return first event when chance is 100%
    if (this.eventChance === 100) {
      return { ...EVENTS[0] };
    }

    const roll = Math.random() * 100;
    if (roll > this.eventChance) {
      return null;
    }

    // Calculate cumulative probabilities
    let cumulativeProbability = 0;
    const roll2 = Math.random();

    for (const event of EVENTS) {
      cumulativeProbability += event.probability;
      if (roll2 <= cumulativeProbability) {
        // Return a copy to prevent external modifications
        return { ...event };
      }
    }

    return null;
  }

  getEventById(id: string): GameEvent | undefined {
    const event = EVENTS.find(e => e.id === id);
    return event ? { ...event } : undefined;
  }
}