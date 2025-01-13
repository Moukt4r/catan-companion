import React, { memo } from 'react';
import type { DiceRoll } from '../types/diceTypes';
import { SpecialDie } from './SpecialDie';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling: boolean;
}

export const DiceDisplay = memo<DiceDisplayProps>(({ roll, isRolling }) => {
  const dieClasses = `w-16 h-16 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold
    ${isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}`;

  return (
    <div className="mt-4 text-center" aria-live="polite">
      <div className="flex justify-center space-x-4 mb-2">
        <div 
          className={dieClasses}
          role="img"
          aria-label={`First die showing ${roll.dice1}`}
        >
          {roll.dice1}
        </div>
        <div 
          className={dieClasses}
          role="img"
          aria-label={`Second die showing ${roll.dice2}`}
        >
          {roll.dice2}
        </div>
        {roll.specialDie && (
          <SpecialDie 
            face={roll.specialDie} 
            className={isRolling ? 'animate-bounce' : 'transform transition-transform hover:scale-105'}
          />
        )}
      </div>
      <div className="text-xl font-bold" aria-atomic="true">
        Sum: {roll.sum}
      </div>
    </div>
  );
});