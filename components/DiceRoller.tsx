import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '../utils/diceRoller';
import { EventSystem } from '../utils/eventSystem';
import { DiceDisplay } from './DiceDisplay';
import { EventDisplay } from './EventDisplay';
import type { DiceRoll } from '../types/diceTypes';
import type { GameEvent } from '../utils/events';

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [eventSystem] = useState(() => new EventSystem());
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [discardCount, setDiscardCount] = useState(4);
  const [useSpecialDie, setUseSpecialDie] = useState(false);
  const [eventChance, setEventChance] = useState(15);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = useCallback(async () => {
    setIsRolling(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
    
    const event = eventSystem.checkForEvent();
    setCurrentEvent(event);
    
    setIsRolling(false);
  }, [diceRoller, eventSystem]);

  const handleDiscardChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0 && newCount < 36) {
      setDiscardCount(newCount);
      diceRoller.setDiscardCount(newCount);
    }
  }, [diceRoller]);

  const handleSpecialDieToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setUseSpecialDie(newValue);
    diceRoller.setUseSpecialDie(newValue);
  }, [diceRoller]);

  const handleEventChanceChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newChance = parseInt(event.target.value, 10);
    if (!isNaN(newChance) && newChance >= 0 && newChance <= 100) {
      setEventChance(newChance);
      eventSystem.setEventChance(newChance);
    }
  }, [eventSystem]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {currentEvent && (
        <EventDisplay 
          event={currentEvent} 
          onClose={() => setCurrentEvent(null)} 
        />
      )}
      
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
            aria-label="Number of combinations to discard"
          />
        </div>
        
        <div>
          <label htmlFor="eventChance" className="block text-sm font-medium text-gray-700 mb-1">
            Event Chance (%):
          </label>
          <input
            type="number"
            id="eventChance"
            min="0"
            max="100"
            value={eventChance}
            onChange={handleEventChanceChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            aria-label="Percentage chance of random event"
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
          remainingRolls={diceRoller.getRemainingRolls()}
        />
      )}
    </div>
  );
};