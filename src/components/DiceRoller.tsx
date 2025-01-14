import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import { DiceDisplay } from './DiceDisplay';
import { Loader, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { DiceRoll } from '@/types/diceTypes';

export const DiceRoller: React.FC = () => {
  const [diceRoller] = useState(() => new DiceRollerUtil());
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [discardCount, setDiscardCount] = useState(4);
  const [useSpecialDie, setUseSpecialDie] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  const [totalPips, setTotalPips] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);

  const playDiceSound = useCallback(() => {
    if (isSoundEnabled) {
      const audio = new Audio('/dice-roll.mp3');
      audio.play().catch(() => {});
    }
  }, [isSoundEnabled]);

  const handleRoll = useCallback(async () => {
    setIsRolling(true);
    playDiceSound();
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const roll = diceRoller.roll();
    setCurrentRoll(roll);
    setRollCount(prev => prev + 1);
    setTotalPips(prev => prev + roll.sum);
    setRollHistory(prev => [roll, ...prev].slice(0, 10));
    setIsRolling(false);
  }, [diceRoller, playDiceSound]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'r' || event.key === 'R') {
      handleRoll();
    }
  }, [handleRoll]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

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

  const resetStats = useCallback(() => {
    setRollCount(0);
    setTotalPips(0);
    setRollHistory([]);
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="discardCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discard Count (0-35):
            </label>
            <input
              type="number"
              id="discardCount"
              min="0"
              max="35"
              value={discardCount}
              onChange={handleDiscardChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg
                shadow-sm focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent
                dark:text-white transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useSpecialDie"
                checked={useSpecialDie}
                onChange={handleSpecialDieToggle}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="useSpecialDie" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Cities & Knights Die
              </label>
            </div>

            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              aria-label={`${isSoundEnabled ? 'Disable' : 'Enable'} sound`}
              title={`${isSoundEnabled ? 'Disable' : 'Enable'} sound effects`}
            >
              {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={`w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600
            text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800
            ${isRolling ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isRolling ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Rolling...
            </span>
          ) : 'Roll Dice (Press R)'}
        </button>

        {currentRoll && <DiceDisplay roll={currentRoll} isRolling={isRolling} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>Total Rolls:</span>
            <span className="font-medium">{rollCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Average Roll:</span>
            <span className="font-medium">{rollCount > 0 ? (totalPips / rollCount).toFixed(1) : '0.0'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Remaining Rolls:</span>
            <span className="font-medium">{diceRoller.getRemainingRolls()}</span>
          </div>
        </div>

        {rollHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Roll History</h3>
              <button
                onClick={resetStats}
                className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="Reset statistics"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {rollHistory.map((roll, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm"
                >
                  <span>Roll {rollHistory.length - index}:</span>
                  <span className="font-medium">
                    {roll.dice1} + {roll.dice2} = {roll.sum}
                    {roll.specialDie && ` (${roll.specialDie})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};