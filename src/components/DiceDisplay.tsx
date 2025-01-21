import React from 'react';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_INFO } from '@/types/diceTypes';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling: boolean;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ roll, isRolling }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex justify-center space-x-4">
        <div
          role="img"
          aria-label={`First die showing ${roll.dice1}`}
          className={`w-16 h-16 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
          flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce' : ''}`}
        >
          {roll.dice1}
        </div>
        <div
          role="img"
          aria-label={`Second die showing ${roll.dice2}`}
          className={`w-16 h-16 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
          flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce' : ''}`}
        >
          {roll.dice2}
        </div>
      </div>
      <div className="text-xl font-bold dark:text-white">
        Sum: {roll.sum}
      </div>
    </div>
  );
};