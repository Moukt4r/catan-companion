import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Swords, Settings } from 'lucide-react';

interface BarbarianTrackerProps {
  defaultThreshold?: number;
  threshold?: number;
}

export interface BarbarianTrackerRef {
  advance: () => void;
}

export const BarbarianTracker = forwardRef<BarbarianTrackerRef, BarbarianTrackerProps>(
  ({ defaultThreshold = 7, threshold: controlledThreshold }, ref) => {
    const [progress, setProgress] = useState(0);
    const [knightCount, setKnightCount] = useState(0);
    const [attacks, setAttacks] = useState<{ date: Date; success: boolean }[]>([]);
    const [threshold, setThreshold] = useState(defaultThreshold);
    const [showSettings, setShowSettings] = useState(false);

    useImperativeHandle(ref, () => ({
      advance: () => setProgress(p => Math.min(p + 1, threshold))
    }));

    // Use controlled threshold if provided
    useEffect(() => {
      if (typeof controlledThreshold === 'number') {
        setThreshold(controlledThreshold);
      }
    }, [controlledThreshold]);

    useEffect(() => {
      if (progress >= threshold) {
        // Barbarian Attack!
        const success = knightCount >= 3;
        // Play attack sound
        const audio = new Audio('/barbarian-attack.mp3');
        audio.play().catch(() => {}); // Ignore any autoplay errors
        setAttacks(prev => [{ date: new Date(), success }, ...prev]);
        setProgress(0);
        // Reset knights after attack
        setKnightCount(0);
      }
    }, [progress, threshold, knightCount]);

    const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value, 10);
      if (!isNaN(value) && value > 0) {
        setThreshold(value);
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Swords data-testid="swords-icon" className="text-blue-600 dark:text-blue-400" />
              Barbarian Progress
            </h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Configure threshold"
            >
              <Settings data-testid="settings-icon" size={16} />
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Knights: {knightCount}
          </div>
        </div>

        {showSettings && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Attack Threshold (steps)
            </label>
            <input
              id="threshold"
              type="number"
              min="1"
              value={threshold}
              onChange={handleThresholdChange}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg dark:text-white"
            />
          </div>
        )}

        {/* Progress bar */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4" role="progressbar" aria-valuenow={Math.round((progress / threshold) * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-red-500 dark:bg-red-600 transition-all duration-500"
            style={{ width: `${(progress / threshold) * 100}%` }}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setProgress(p => Math.min(p + 1, threshold))}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition-colors"
          >
            Advance
          </button>
          <button
            onClick={() => setKnightCount(k => k + 1)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded transition-colors"
          >
            Add Knight
          </button>
        </div>

        {attacks.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Attack History</h4>
            <div className="space-y-1 text-sm">
              {attacks.map((attack, i) => (
                <div
                  key={i}
                  className={`flex justify-between ${
                    attack.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <span>{attack.date.toLocaleDateString()}</span>
                  <span>{attack.success ? 'Defended!' : 'Failed!'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

BarbarianTracker.displayName = 'BarbarianTracker';