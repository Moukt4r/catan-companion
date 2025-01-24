import React from 'react';
import type { DiceRoll } from '../types/diceTypes';
import { LoadingSpinner } from './LoadingSpinner';

interface DiceDisplayProps {
  roll: DiceRoll;
  isRolling: boolean;
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ roll, isRolling }) => {
  return (
    <div data-testid="dice-display" className="mt-4 space-y-2">
      <div className="flex justify-center items-center space-x-4">
        {isRolling ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="text-4xl">{roll.die1}</div>
            <div className="text-2xl">+</div>
            <div className="text-4xl">{roll.die2}</div>
            <div className="text-2xl">=</div>
            <div className="text-4xl font-bold">{roll.sum}</div>
            {roll.specialDie && (
              <>
                <div className="text-2xl ml-4">Special Die:</div>
                <div className="text-4xl">{roll.specialDie}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};