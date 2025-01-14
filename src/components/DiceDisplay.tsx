import React from 'react';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_COLORS, SPECIAL_DIE_ICONS } from '@/types/diceTypes';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling: boolean;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ roll, isRolling }) => {
  const renderSpecialDie = (face: DiceRoll['specialDie']) => {
    if (!face || !SPECIAL_DIE_COLORS[face]) return null;
    return (
      <span className={`inline-flex items-center gap-2 ${SPECIAL_DIE_COLORS[face]}`}>
        {SPECIAL_DIE_ICONS[face]}
      </span>
    );
  };

  return (
    <div className="mt-6 text-center" aria-live="polite">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex justify-center space-x-4">
          <div 
            className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg 
              flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce' : ''}`}
            role="img"
            aria-label={`First die showing ${roll.dice1}`}
          >
            {roll.dice1}
          </div>
          <div 
            className={`w-16 h-16 bg-white border-2 border-gray-300 rounded-lg 
              flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce delay-100' : ''}`}
            role="img"
            aria-label={`Second die showing ${roll.dice2}`}
          >
            {roll.dice2}
          </div>
        </div>
        <div className="text-xl font-bold">
          Sum: {roll.sum}
        </div>
        {roll.specialDie && renderSpecialDie(roll.specialDie)}
      </div>
    </div>
  );
};

export default DiceDisplay;