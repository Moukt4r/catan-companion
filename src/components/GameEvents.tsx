import React, { useState, useCallback } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

type EventType = 'positive' | 'negative' | 'neutral';

interface GameEvent {
  id: number;
  type: EventType;
  description: string;
}

const EVENTS: GameEvent[] = [
  { id: 1, type: 'positive', description: 'Trade winds are favorable! You may trade any resource 2:1 this turn.' },
  { id: 2, type: 'negative', description: 'Storm damages your city! Lose 1 resource of your choice.' },
  { id: 3, type: 'neutral', description: 'Diplomatic Mission! Player with the most politics cards reveals one.' },
];

export interface GameEventsRef {
  checkForEvent: () => void;
}

export const GameEvents = React.forwardRef<GameEventsRef>((props, ref) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [eventChance, setEventChance] = useState(0.15);
  
  React.useImperativeHandle(ref, () => ({
    checkForEvent: () => {
      if (Math.random() < eventChance) {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setCurrentEvent(event);
        setEventHistory(prev => [event, ...prev].slice(0, 10));
      }
    }
  }));

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 />;
      case 'negative':
        return <AlertTriangle />;
      case 'neutral':
        return <AlertCircle />;
    }
  };

  if (!currentEvent && eventHistory.length === 0) return null;

  return (
    <div className="space-y-4">
      {currentEvent && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center gap-2">
            {getEventIcon(currentEvent.type)}
            <span>Event!</span>
          </div>
          <p>{currentEvent.description}</p>
        </div>
      )}

      {showHistory && eventHistory.map((event, index) => (
        <div key={index} className="flex items-center gap-2">
          {getEventIcon(event.type)}
          <span>{event.description}</span>
        </div>
      ))}
    </div>
  );
});

GameEvents.displayName = 'GameEvents';