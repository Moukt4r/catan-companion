import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Swords } from 'lucide-react';

interface BarbarianTrackerProps {
  threshold?: number;
}

export interface BarbarianTrackerRef {
  advance: () => void;
}

export const BarbarianTracker = forwardRef<BarbarianTrackerRef, BarbarianTrackerProps>((
  { threshold = 7 }: BarbarianTrackerProps,
  ref
) => {
  const [progress, setProgress] = useState(0);
  const [knightCount, setKnightCount] = useState(0);
  const [attacks, setAttacks] = useState<{date: Date; success: boolean}[]>([]);

  useImperativeHandle(ref, () => ({
    advance: () => setProgress(p => Math.min(p + 1, threshold))
  }));

  useEffect(() => {
    if (progress >= threshold) {
      // Barbarian Attack!
      const success = knightCount >= 3;
      setAttacks(prev => [{ date: new Date(), success }, ...prev]);
      setProgress(0);
      // Reset knights after attack
      setKnightCount(0);
    }
  }, [progress, threshold, knightCount]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Swords className="text-red-500" />
          Barbarian Progress
        </h3>
        <div>
          Knights: {knightCount}
        </div>
      </div>

      <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${(progress / threshold) * 100}%` }}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setProgress(p => Math.min(p + 1, threshold))}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Advance
        </button>
        <button
          onClick={() => setKnightCount(k => k + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Knight
        </button>
      </div>

      {attacks.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Attack History</h4>
          <div className="space-y-1">
            {attacks.map((attack, i) => (
              <div
                key={i}
                className={`flex justify-between ${attack.success ? 'text-green-600' : 'text-red-600'}`}
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
});

BarbarianTracker.displayName = 'BarbarianTracker';