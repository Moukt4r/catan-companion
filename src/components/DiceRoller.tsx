import React, { useState, useCallback } from 'react';
import { DiceRoller as DiceRollerUtil } from '@/utils/diceRoller';
import { DiceDisplay } from './DiceDisplay';
import { Loader, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { DiceRoll } from '@/types/diceTypes';
import { SPECIAL_DIE_COLORS, SPECIAL_DIE_ICONS } from '@/types/diceTypes';
import { GameEvents } from './GameEvents';

interface DiceRollerProps {
  onBarbarianRoll?: () => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onBarbarianRoll }) => {
  // ... rest of the component stays the same ...

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg"
          />
        </div>
        
        <div className="flex items-center justify-end">
          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="sound-toggle p-2 text-gray-600 hover:text-blue-600"
            aria-label={`${isSoundEnabled ? 'Disable' : 'Enable'} sound`}
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>
      
      <button
        onClick={handleRoll}
        disabled={isRolling}
        className="roll-dice-btn w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
      >
        {isRolling ? (
          <span className="flex items-center justify-center">
            <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
            Rolling...
          </span>
        ) : 'Roll Dice (Press R)'}
      </button>

      {/* ... rest of the component stays the same ... */}
    </div>
  );
};