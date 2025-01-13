import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '../utils/diceRoller';
import { EventSystem } from '../utils/eventSystem';
import { DiceDisplay } from './DiceDisplay';
import { EventDisplay } from './EventDisplay';
import { EventHistory } from './EventHistory';
import { EventStats } from './EventStats';
import type { GameEvent } from '../types/eventTypes';

const AUTO_DISMISS_DURATION = 5000; // 5 seconds

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [eventSystem] = useState(() => new EventSystem());
  const [currentRoll, setCurrentRoll] = useState(null);
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [discardCount, setDiscardCount] = useState(4);
  const [useSpecialDie, setUseSpecialDie] = useState(false);
  const [eventChance, setEventChance] = useState(15);
  const [isRolling, setIsRolling] = useState(false);
  const [isDraggingChance, setIsDraggingChance] = useState(false);

  const handleRoll = useCallback(async () => {
    setIsRolling(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
    
    const event = eventSystem.checkForEvent();
    if (event) {
      setActiveEvents(prev => [...prev, event]);
    }
    
    setIsRolling(false);
  }, [diceRoller, eventSystem]);

  const handleEventChanceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newChance = parseInt(event.target.value, 10);
    if (!isNaN(newChance) && newChance >= 0 && newChance <= 100) {
      setEventChance(newChance);
      eventSystem.setEventChance(newChance);
    }
  }, [eventSystem]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Active Events */}
      <div className="space-y-2 mb-4">
        {activeEvents.map(event => (
          <EventDisplay
            key={`${event.id}-${Date.now()}`}
            event={event}
            onClose={() => setActiveEvents(prev => prev.filter(e => e.id !== event.id))}
            autoDismissAfter={AUTO_DISMISS_DURATION}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="eventChance" className="block text-sm font-medium text-gray-700 mb-1">
            Event Chance
          </label>
          <div className="relative">
            <input
              type="range"
              id="eventChance"
              min="0"
              max="100"
              value={eventChance}
              onChange={handleEventChanceChange}
              onMouseDown={() => setIsDraggingChance(true)}
              onMouseUp={() => setIsDraggingChance(false)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            {isDraggingChance && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                {eventChance}%
              </div>
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500 text-right">{eventChance}%</div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowHistory(prev => !prev)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Event History
          </button>
          <button
            onClick={() => setShowStats(prev => !prev)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Statistics
          </button>
        </div>

        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors
            ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>
      </div>

      {/* Event History Modal */}
      {showHistory && (
        <EventHistory
          history={eventSystem.getHistory()}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Event Stats Modal */}
      {showStats && (
        <EventStats
          events={eventSystem.getAllEvents()}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Current Roll Display */}
      {currentRoll && (
        <DiceDisplay roll={currentRoll} isRolling={isRolling} />
      )}
    </div>
  );
};