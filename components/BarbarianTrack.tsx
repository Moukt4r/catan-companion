import React, { useState, useCallback } from 'react';
import { AlertTriangle, Settings, RotateCcw } from 'lucide-react';
import type { BarbarianState } from '../utils/barbarianTracker';

interface BarbarianTrackProps {
  state: BarbarianState;
  onReset: () => void;
  onConfigureMax: (max: number) => void;
}

export const BarbarianTrack: React.FC<BarbarianTrackProps> = ({
  state,
  onReset,
  onConfigureMax
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [maxInput, setMaxInput] = useState(state.maxProgress.toString());

  const handleMaxUpdate = useCallback(() => {
    const newMax = parseInt(maxInput, 10);
    if (!isNaN(newMax) && newMax > 0) {
      onConfigureMax(newMax);
      setIsConfiguring(false);
    }
  }, [maxInput, onConfigureMax]);

  const progress = (state.currentProgress / state.maxProgress) * 100;

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4"
      data-testid="barbarian-track"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Barbarian Track</h3>
          <p className="text-sm text-gray-500">
            Knights: {state.knights} | Attacks: {state.attackHistory.length}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsConfiguring(prev => !prev)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Configure settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onReset}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Reset progress"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {isConfiguring && (
        <div className="mb-4 flex space-x-2">
          <input
            type="number"
            min="1"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            aria-label="Maximum barbarian progress"
          />
          <button
            onClick={handleMaxUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set Max
          </button>
        </div>
      )}

      <div className="relative pt-1">
        <div className="overflow-hidden h-6 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
              state.isAttacking ? 'bg-red-600' : 'bg-yellow-500'
            }`}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>{state.currentProgress} / {state.maxProgress}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {state.isAttacking && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertTriangle className="mr-2" size={20} />
          <span className="font-medium">Barbarians Attack!</span>
        </div>
      )}
    </div>
  );
};