import React from 'react';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_INFO } from '@/types/diceTypes';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling?: boolean;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ roll, isRolling = false }) => {
  const renderSpecialDie = (face: DiceRoll['specialDie']) => {
    if (!face || !SPECIAL_DIE_INFO[face]) return null;
    
    const { color, icon, label } = SPECIAL_DIE_INFO[face];
    return (
      <div 
        className="flex items-center gap-2 mt-2" 
        title={`${label} Die Face`}
      >
        <span className={`w-3 h-3 rounded-full ${color}`} />
        <span>{icon}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
    );
  };

  return (
    <div className="mt-6 text-center" aria-live="polite">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex justify-center space-x-4">
          <div 
            className={`w-16 h-16 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
              flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce' : ''}`}
            role="img"
            aria-label={`First die showing ${roll.dice1}`}
          >
            {roll.dice1}
          </div>
          <div 
            className={`w-16 h-16 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg 
              flex items-center justify-center text-2xl font-bold ${isRolling ? 'animate-bounce delay-100' : ''}`}
            role="img"
            aria-label={`Second die showing ${roll.dice2}`}
          >
            {roll.dice2}
          </div>
        </div>
        <div className="text-xl font-bold dark:text-white">
          Sum: {roll.sum}
        </div>
        {roll.specialDie && renderSpecialDie(roll.specialDie)}
      </div>
    </div>
  );
};