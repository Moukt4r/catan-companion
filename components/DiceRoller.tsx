import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '../utils/diceRoller';
import { SpecialDie } from './SpecialDie';
import type { DiceRoll } from '../types/diceTypes';

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [discardCount, setDiscardCount] = useState(4);
  const [useSpecialDie, setUseSpecialDie] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = useCallback(async () => {
    setIsRolling(true);
    // Add a small delay for animation
    await new Promise(resolve => setTimeout(resolve, 600));
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
    setIsRolling(false);
  }, [diceRoller]);

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
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
        <div className="mt-4 text-center" aria-live="polite">
          <div className="flex justify-center space-x-4 mb-2">
            <div 
              className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
                ${isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}`}
              role="img"
              aria-label={`First die showing ${currentRoll.dice1}`}
            >
              {currentRoll.dice1}
            </div>
            <div 
              className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
                ${isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}`}
              role="img"
              aria-label={`Second die showing ${currentRoll.dice2}`}
            >
              {currentRoll.dice2}
            </div>
            {currentRoll.specialDie && (
              <SpecialDie 
                face={currentRoll.specialDie} 
                className={isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}
              />
            )}
          </div>
          <div className="text-xl font-bold">
            Sum: {currentRoll.sum}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Remaining rolls: {diceRoller.getRemainingRolls()}
          </div>
        </div>
      )}
    </div>
  );
};