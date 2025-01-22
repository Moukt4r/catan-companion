import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import { DiceDisplay } from './DiceDisplay';
import { Loader, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_INFO } from '@/types/diceTypes';

interface DiceRollerProps {
  onRoll?: (roll: DiceRoll) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [diceRoller, setDiceRoller] = useState(() => new DiceRollerUtil(4, true));
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [discardCount, setDiscardCount] = useState(4);
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
    if (isRolling) return;
    
    setIsRolling(true);
    playDiceSound();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const roll = diceRoller.roll();
      
      setCurrentRoll(roll);
      setRollCount(prev => prev + 1);
      setTotalPips(prev => prev + roll.sum);
      setRollHistory(prev => [roll, ...prev].slice(0, 10));

      if (onRoll) {
        onRoll(roll);
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      // Reinitialize dice roller if something went wrong
      setDiceRoller(new DiceRollerUtil(discardCount, true));
    } finally {
      setIsRolling(false);
    }
  }, [diceRoller, discardCount, isRolling, playDiceSound, onRoll]);

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
      try {
        diceRoller.setDiscardCount(newCount);
      } catch (error) {
        console.error('Error setting discard count:', error);
        setDiceRoller(new DiceRollerUtil(newCount, true));
      }
    }
  }, [diceRoller]);

  const resetStats = useCallback(() => {
    setRollCount(0);
    setTotalPips(0);
    setRollHistory([]);
  }, []);

  const renderSpecialDie = (face: DiceRoll['specialDie']) => {
    if (!face || !SPECIAL_DIE_INFO[face]) return null;
    
    const { color, icon, label } = SPECIAL_DIE_INFO[face];
    return (
      <span 
        className="inline-flex items-center gap-1" 
        title={`${label} Die Face`}
      >
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span>{icon}</span>
      </span>
    );
  };

  return (
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
            data-testid="discard-count"
            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white"
          />
        </div>
        
        <div className="flex items-center justify-end">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300"
            aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
            data-testid="sound-toggle"
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      
      <button
        onClick={handleRoll}
        disabled={isRolling}
        data-testid="roll-button"
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50"
      >
        {isRolling ? (
          <span className="flex items-center justify-center">
            <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Rolling...
          </span>
        ) : 'Roll Dice (Press R)'}
      </button>

      {currentRoll && <DiceDisplay roll={currentRoll} isRolling={isRolling} />}

      <div className="space-y-2">
        <div data-testid="total-rolls">Total Rolls: {rollCount}</div>
        <div data-testid="average-roll">Average Roll: {rollCount > 0 ? (totalPips / rollCount).toFixed(1) : '0.0'}</div>
        <div data-testid="remaining-rolls">Remaining Rolls: {diceRoller.getRemainingRolls()}</div>
      </div>

      {rollHistory.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Roll History</h3>
            <button
              onClick={resetStats}
              data-testid="reset-stats"
              className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300"
              title="Reset statistics"
            >
              <RotateCcw size={18} />
            </button>
          </div>
          <div className="space-y-1 text-sm">
            {rollHistory.map((roll, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>
                  Roll {rollHistory.length - index}: {roll.dice1} + {roll.dice2} = {roll.sum}
                </span>
                {roll.specialDie && renderSpecialDie(roll.specialDie)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};