import Header from '@/components/Header';
import { DiceRoller } from '@/components/DiceRoller';
import { BarbarianTracker, type BarbarianTrackerRef } from '@/components/BarbarianTracker';
import { GameEvents, type GameEventsRef } from '@/components/GameEvents';
import { useCallback, useRef } from 'react';
import type { DiceRoll } from '@/types/diceTypes';

export default function Home() {
  const barbarianTrackerRef = useRef<BarbarianTrackerRef | null>(null);
  const gameEventsRef = useRef<GameEventsRef | null>(null);

  const handleDiceRoll = useCallback((roll: DiceRoll) => {
    // Only advance barbarian progress on barbarian special die face
    if (roll.specialDie === 'barbarian') {
      barbarianTrackerRef.current?.advance();
    }
    // Check for random events on each roll
    gameEventsRef.current?.checkForEvent();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Roll the Dice</h2>
            <DiceRoller onRoll={handleDiceRoll} />
          </div>
          <BarbarianTracker ref={barbarianTrackerRef} />
          <GameEvents ref={gameEventsRef} />
        </div>
      </div>
    </main>
  );
}