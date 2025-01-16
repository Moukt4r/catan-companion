import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

type EventType = 'positive' | 'negative' | 'neutral';

interface GameEvent {
  id: number;
  type: EventType;
  description: string;
}

export interface GameEventsRef {
  checkForEvent: () => void;
}

interface GameEventsProps {
  events?: GameEvent[];
  initialEvent?: GameEvent;
}

export const GameEvents = forwardRef<GameEventsRef, GameEventsProps>(({ events = [], initialEvent }, ref) => {
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(initialEvent ?? null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>(initialEvent ? [initialEvent] : []);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [eventChance, setEventChance] = useState(0.15); // 15% chance by default
  const [isEventsEnabled, setIsEventsEnabled] = useState(true);
  const [dismissTimer, setDismissTimer] = useState<number | null>(null);

  const dismissEvent = useCallback((eventId: number) => {
    setCurrentEvent(prev => prev?.id === eventId ? null : prev);
  }, []);

  const addEventToHistory = useCallback((event: GameEvent) => {
    if (!event || !event.id) return;
    setEventHistory(prev => [event, ...prev]);
  }, []);

  useImperativeHandle(ref, () => ({
    checkForEvent: () => {
      if (!isEventsEnabled || events.length === 0) return;

      if (Math.random() < eventChance) {
        const selectedEvent = events[Math.floor(Math.random() * events.length)];
        if (!selectedEvent) return;

        // Clear any existing timer
        if (dismissTimer) {
          window.clearTimeout(dismissTimer);
          setDismissTimer(null);
        }

        // Set current event and add to history
        setCurrentEvent(selectedEvent);
        addEventToHistory(selectedEvent);

        // Set auto-dismiss timer
        const timerId = window.setTimeout(() => {
          dismissEvent(selectedEvent.id);
          setDismissTimer(null);
        }, 10000);
        
        setDismissTimer(timerId);
      }
    }
  }), [isEventsEnabled, eventChance, events, addEventToHistory, dismissEvent, dismissTimer]);

  // Function to get the appropriate icon based on event type
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 data-testid="success-icon" className="text-green-500 dark:text-green-400" size={20} />;
      case 'negative':
        return <AlertTriangle data-testid="warning-icon" className="text-red-500 dark:text-red-400" size={20} />;
      case 'neutral':
        return <AlertCircle data-testid="info-icon" className="text-blue-500 dark:text-blue-400" size={20} />;
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
            <Settings size={16} data-testid="settings-icon" />
          </button>
        </div>
        {eventHistory.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
              aria-label="Enable random events"
            />
            <label htmlFor="eventsEnabled" className="text-sm font-medium dark:text-gray-300">
              Enable random events
            </label>
          </div>

          <div>
            <label htmlFor="eventChance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              aria-label="Event Chance (0-100%)"
            />
          </div>
        </div>
      )}

      {currentEvent && (
        <div 
          className={`p-4 rounded-lg mb-4 ${
            currentEvent.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' :
            currentEvent.type === 'negative' ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' :
            'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
          }`}
          data-testid="current-event"
        >
          <div className="flex items-center gap-2">
            {getEventIcon(currentEvent.type)}
            <span className="font-medium">Event!</span>
          </div>
          <p className="mt-2 dark:text-gray-300">{currentEvent.description}</p>
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