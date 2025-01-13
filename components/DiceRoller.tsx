import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [currentRoll, setCurrentRoll] = useState<{ dice1: number; dice2: number; sum: number } | null>(null);
  const [discardCount, setDiscardCount] = useState(4);

  const handleRoll = useCallback(() => {
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
  }, [diceRoller]);

  const handleDiscardChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount >= 0 && newCount < 36) {
      setDiscardCount(newCount);
      diceRoller.setDiscardCount(newCount);
    }
  }, [diceRoller]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
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
      
      <button
        onClick={handleRoll}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Roll Dice
      </button>

      {currentRoll && (
        <div className="mt-4 text-center">
          <div className="flex justify-center space-x-4 mb-2">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold">
              {currentRoll.dice1}
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold">
              {currentRoll.dice2}
            </div>
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