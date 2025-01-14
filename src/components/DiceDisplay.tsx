import React from 'react';
import type { DiceRoll } from '@/types/diceTypes';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling: boolean;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ roll, isRolling }) => {
  return (
    <div className="mt-4 text-center" aria-live="polite">
      <div className="flex justify-center space-x-4 mb-2">
        <div 
          className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
            ${isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}`}
          role="img"
          aria-label={`First die showing ${roll.dice1}`}
        >
          {roll.dice1}
        </div>
        <div 
          className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
            ${isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}`}
          role="img"
          aria-label={`Second die showing ${roll.dice2}`}
        >
          {roll.dice2}
        </div>
      </div>
      <div className="text-xl font-bold">
        Sum: {roll.sum}
      </div>
    </div>
  );
};