export type EventType = 'positive' | 'negative' | 'neutral';
export type EventSeverity = 'low' | 'medium' | 'high';
export type EventCategory = 'resource' | 'trade' | 'development' | 'military' | 'infrastructure';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  severity: EventSeverity;
  category: EventCategory;
  duration?: number; // Duration in rounds, undefined means instant
  prerequisites?: {
    cities?: number;
    victoryPoints?: number;
    developments?: number;
  };
}

export interface EventHistoryEntry {
  event: GameEvent;
  timestamp: number;
  dismissed: boolean;
}