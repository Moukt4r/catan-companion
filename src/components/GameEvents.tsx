import React, { useState, forwardRef, useImperativeHandle } from 'react';
import * as Icons from 'lucide-react';

type EventType = 'positive' | 'negative' | 'neutral';

interface GameEvent {
  id: number;
  type: EventType;
  description: string;
  threshold?: number;
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

const DEFAULT_EVENT_CHANCE = 0.15; // 15% chance by default

export interface GameEventsRef {
  checkForEvent: () => void;
}

export const GameEvents = forwardRef<GameEventsRef>((props, ref) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [eventChance, setEventChance] = useState(DEFAULT_EVENT_CHANCE);
  const [isEventsEnabled, setIsEventsEnabled] = useState(true);

  useImperativeHandle(ref, () => ({
    checkForEvent: () => {
      if (!isEventsEnabled) return;

      if (Math.random() < eventChance) {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setCurrentEvent(event);
        setEventHistory(prev => [event, ...prev].slice(0, 10));

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          setCurrentEvent(null);
        }, 10000);
      }
    }
  }), [eventChance, isEventsEnabled]);

  const getEventIcon = (type: EventType) => {
    const props = {
      'data-testid': `${type}-icon`,
      className: type === 'positive' ? 'text-green-500 dark:text-green-400' :
                 type === 'negative' ? 'text-red-500 dark:text-red-400' :
                 'text-blue-500 dark:text-blue-400',
      size: 20
    };

    switch (type) {
      case 'positive':
        return <Icons.CheckCircle2 {...props} />;
      case 'negative':
        return <Icons.AlertTriangle {...props} />;
      case 'neutral':
        return <Icons.AlertCircle {...props} />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Game Events</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Configure events"
          >
            <Icons.Settings size={16} data-testid="settings-icon" />
          </button>
        </div>
        {eventHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            data-testid="toggle-history"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="eventsEnabled"
              checked={isEventsEnabled}
              onChange={(e) => setIsEventsEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="eventsEnabled" className="text-sm font-medium dark:text-gray-300">
              Enable random events
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="eventChance">
              Event Chance (0-100%)
            </label>
            <input
              type="number"
              id="eventChance"
              min="0"
              max="100"
              value={Math.round(eventChance * 100)}
              onChange={(e) => setEventChance(Math.min(1, Math.max(0, parseInt(e.target.value) / 100)))}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg dark:text-white"
            />
          </div>
        </div>
      )}

      {currentEvent && (
        <div 
          data-testid="current-event"
          className={`p-4 rounded-lg mb-4 ${
            currentEvent.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' :
            currentEvent.type === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' :
            'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {getEventIcon(currentEvent.type)}
            <span className="font-medium">Event!</span>
          </div>
          <p className="mt-2 dark:text-gray-300" data-testid={`current-event-text-${currentEvent.type}`}>
            {currentEvent.description}
          </p>
        </div>
      )}

      {showHistory && eventHistory.length > 0 && (
        <div className="space-y-2" data-testid="event-history">
          {eventHistory.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              {getEventIcon(event.type)}
              <span>{event.description}</span>
            </div>
          ))}
        </div>
      )}

      {!currentEvent && !showHistory && eventHistory.length === 0 && isEventsEnabled && (
        <p className="text-gray-600 dark:text-gray-400 text-sm italic">
          Each dice roll has a {Math.round(eventChance * 100)}% chance to trigger a random event.
        </p>
      )}
    </div>
  );
});

GameEvents.displayName = 'GameEvents';