import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '../utils/diceRoller';
import { EventSystem } from '../utils/eventSystem';
import { BarbarianTracker } from '../utils/barbarianTracker';
import { DiceDisplay } from './DiceDisplay';
import { EventDisplay } from './EventDisplay';
import { BarbarianTrack } from './BarbarianTrack';
import type { DiceRoll } from '../types/diceTypes';
import type { GameEvent } from '../types/eventTypes';

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [eventSystem] = useState(() => new EventSystem());
  const [barbarianTracker] = useState(() => new BarbarianTracker());
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [discardCount, setDiscardCount] = useState(4);
  const [useSpecialDie, setUseSpecialDie] = useState(false);
  const [eventChance, setEventChance] = useState(15);
  const [isRolling, setIsRolling] = useState(false);
  const [barbarianState, setBarbarianState] = useState(() => barbarianTracker.getState());

  const handleRoll = useCallback(async () => {
    setIsRolling(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
    
    const event = eventSystem.checkForEvent();
    if (event) {
      setCurrentEvent(event);
    }
    
    // Advance barbarian track if special die shows barbarian
    if (roll.specialDie === 'barbarian') {
      barbarianTracker.advance();
      setBarbarianState(barbarianTracker.getState());
    }
    
    setIsRolling(false);
  }, [diceRoller, eventSystem, barbarianTracker]);

  const handleBarbarianReset = useCallback(() => {
    barbarianTracker.reset();
    setBarbarianState(barbarianTracker.getState());
  }, [barbarianTracker]);

  const handleBarbarianMaxChange = useCallback((max: number) => {
    barbarianTracker.setMaxProgress(max);
    setBarbarianState(barbarianTracker.getState());
  }, [barbarianTracker]);

  const handleSpecialDieToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseSpecialDie(newValue);
    diceRoller.setUseSpecialDie(newValue);
  }, [diceRoller]);

  const handleDiscardChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0 && newCount < 36) {
      setDiscardCount(newCount);
      diceRoller.setDiscardCount(newCount);
    }
  }, [diceRoller]);

  return (
    <div className="p-6 space-y-6">
      {/* Barbarian Track */}
      {useSpecialDie && (
        <BarbarianTrack
          state={barbarianState}
          onReset={handleBarbarianReset}
          onConfigureMax={handleBarbarianMaxChange}
        />
      )}

      {/* Event Display */}
      {currentEvent && (
        <EventDisplay 
          event={currentEvent}
          onClose={() => setCurrentEvent(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 space-y-4">
          <div>
            <label htmlFor="discardCount" className="block text-sm font-medium text-gray-700 mb-1">
              Discard Count (0-35):
            </label>
            <input
              type="number"
              id="discardCount"
              min="0"
              max="35"
              value={discardCount}
              onChange={handleDiscardChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="useSpecialDie"
              checked={useSpecialDie}
              onChange={handleSpecialDieToggle}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useSpecialDie" className="ml-2 block text-sm text-gray-900">
              Use Cities & Knights special die
            </label>
          </div>
        </div>
        
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors
            ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </button>

        {currentRoll && (
          <DiceDisplay
            roll={currentRoll}
            isRolling={isRolling}
          />
        )}
      </div>
    </div>
  );
};