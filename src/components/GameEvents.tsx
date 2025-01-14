import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

type EventType = 'positive' | 'negative' | 'neutral';

interface GameEvent {
  id: number;
  type: EventType;
  description: string;
}

const EVENTS: GameEvent[] = [
  { id: 1, type: 'positive', description: 'Trade winds are favorable! +1 resource of your choice.' },
  { id: 2, type: 'positive', description: 'Found ancient trade routes! Get a free road building card.' },
  { id: 3, type: 'positive', description: 'Prosperous times! Draw a development card for free.' },
  { id: 4, type: 'negative', description: 'Storm damages your city! Lose 1 resource of your choice.' },
  { id: 5, type: 'negative', description: 'Barbarians spotted! All players must contribute to defense.' },
  { id: 6, type: 'negative', description: 'Poor harvest! No resource production this turn.' },
  { id: 7, type: 'neutral', description: 'Merchants are interested in your ports. Trading opportunities incoming.' },
  { id: 8, type: 'neutral', description: 'Scouts report barbarian movement. Prepare your defenses.' },
  { id: 9, type: 'neutral', description: 'Foreign traders approaching. Special trades available next turn.' },
];

const EVENT_CHANCE = 0.15; // 15% chance of event

export const GameEvents: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const checkForEvent = () => {
    if (Math.random() < EVENT_CHANCE) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setCurrentEvent(event);
      setEventHistory(prev => [event, ...prev].slice(0, 10));

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setCurrentEvent(null);
      }, 10000);
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="text-green-500" size={20} />;
      case 'negative':
        return <AlertTriangle className="text-red-500" size={20} />;
      case 'neutral':
        return <AlertCircle className="text-blue-500" size={20} />;
    }
  };

  useEffect(() => {
    const timer = setInterval(checkForEvent, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, []);

  if (!currentEvent && eventHistory.length === 0) return null;

  return (
    <div className="mt-6">
      {currentEvent && (
        <div className={`p-4 bg-white rounded-lg shadow-md border-l-4 mb-4 ${currentEvent.type === 'positive' ? 'border-green-500' : currentEvent.type === 'negative' ? 'border-red-500' : 'border-blue-500'}`}>
          <div className="flex items-center gap-2">
            {getEventIcon(currentEvent.type)}
            <span className="font-medium">Event!</span>
          </div>
          <p className="mt-2 text-gray-700">{currentEvent.description}</p>
        </div>
      )}

      {eventHistory.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
          >
            {showHistory ? (
              <>
                <ArrowLeft size={16} />
                Hide History
              </>
            ) : (
              <>
                Show History
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-2">
              {eventHistory.map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  {getEventIcon(event.type)}
                  <span>{event.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};