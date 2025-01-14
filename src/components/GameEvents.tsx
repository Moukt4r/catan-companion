import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

type EventType = 'positive' | 'negative' | 'neutral';

interface GameEvent {
  id: number;
  type: EventType;
  description: string;
  threshold?: number; // Some events only trigger above certain dice rolls
}

const EVENTS: GameEvent[] = [
  // Positive Events
  { id: 1, type: 'positive', description: 'Trade winds are favorable! You may trade any resource 2:1 this turn.' },
  { id: 2, type: 'positive', description: 'Market Day! All players may make one free maritime trade.' },
  { id: 3, type: 'positive', description: 'Merchant Fleet arrives! Harbor fees are waived this round.' },
  { id: 4, type: 'positive', description: 'Golden Age! All cities produce one additional resource.' },
  { id: 5, type: 'positive', description: 'Cultural Exchange! Free development card for the player with the least victory points.' },
  { id: 6, type: 'positive', description: 'Innovation! Science improvements cost 1 less resource this turn.' },
  { id: 7, type: 'positive', description: 'Political Stability! Politics actions are free this round.' },
  { id: 8, type: 'positive', description: 'Resource Boom! Double production on your next resource roll.' },
  { id: 9, type: 'positive', description: 'Trade Treaty! You may trade with the bank at 3:1 this turn.' },
  { id: 10, type: 'positive', description: 'Prosperous Times! Draw a progress card of your choice.' },
  
  // Negative Events
  { id: 11, type: 'negative', description: 'Storm Damage! Cities produce no resources until repaired.' },
  { id: 12, type: 'negative', description: 'Plague! Lose one knight unless you discard a commodity.' },
  { id: 13, type: 'negative', description: 'Civil Unrest! Cannot use politics cards this round.' },
  { id: 14, type: 'negative', description: 'Trade Embargo! No maritime trade this turn.' },
  { id: 15, type: 'negative', description: 'Resource Shortage! All players must discard one resource of their choice.' },
  { id: 16, type: 'negative', description: 'Market Crash! Commodity trades are suspended this round.' },
  { id: 17, type: 'negative', description: 'Barbarian Raid! Knights must be activated to defend cities.' },
  { id: 18, type: 'negative', description: 'Scientific Setback! Science improvements cost 1 extra resource.' },
  { id: 19, type: 'negative', description: 'Political Turmoil! Cannot play politics cards this turn.' },
  { id: 20, type: 'negative', description: 'Resource Tax! Pay one resource for each city you own.' },
  
  // Neutral Events
  { id: 21, type: 'neutral', description: 'Market Fluctuation! All players may renegotiate one trade.' },
  { id: 22, type: 'neutral', description: 'Diplomatic Mission! Player with the most politics cards reveals one.' },
  { id: 23, type: 'neutral', description: 'Scientific Discovery! Science advancements can be purchased in any order.' },
  { id: 24, type: 'neutral', description: 'Trade Routes Shift! Harbor placement rules are ignored this turn.' },
  { id: 25, type: 'neutral', description: 'Cultural Festival! Players may exchange progress cards.' },
  { id: 26, type: 'neutral', description: 'Resource Exchange! Players may swap resources at will.' },
  { id: 27, type: 'neutral', description: 'Knowledge Sharing! Science cards may be traded this turn.' },
  { id: 28, type: 'neutral', description: 'Political Reform! Politics cards may be purchased for 2 resources.' },
  { id: 29, type: 'neutral', description: 'Trade Council! Players vote on new trade rules.' },
  { id: 30, type: 'neutral', description: 'Merchant Visit! Special trades available next turn.' }
];

const EVENT_CHANCE = 0.15; // 15% chance of event by default

export const GameEvents: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const checkForEvent = useCallback(() => {
    if (Math.random() < EVENT_CHANCE) {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setCurrentEvent(event);
      setEventHistory(prev => [event, ...prev].slice(0, 10));

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        setCurrentEvent(null);
      }, 10000);
    }
  }, []);

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
  }, [checkForEvent]);

  if (!currentEvent && eventHistory.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Game Events</h3>
        {eventHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
      </div>

      {currentEvent && (
        <div 
          className={`p-4 rounded-lg mb-4 ${
            currentEvent.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500' :
            currentEvent.type === 'negative' ? 'bg-red-50 border-l-4 border-red-500' :
            'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {getEventIcon(currentEvent.type)}
            <span className="font-medium">Event!</span>
          </div>
          <p className="mt-2">{currentEvent.description}</p>
        </div>
      )}

      {showHistory && eventHistory.length > 0 && (
        <div className="space-y-2">
          {eventHistory.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              {getEventIcon(event.type)}
              <span>{event.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};