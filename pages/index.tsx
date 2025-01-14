import Header from '@/components/Header';
import { DiceRoller } from '@/components/DiceRoller';
import { BarbarianTracker, type BarbarianTrackerRef } from '@/components/BarbarianTracker';
import { GameEvents } from '@/components/GameEvents';
import { useCallback, useRef } from 'react';

export default function Home() {
  const barbarianTrackerRef = useRef<BarbarianTrackerRef | null>(null);

  const handleBarbarianRoll = useCallback(() => {
    barbarianTrackerRef.current?.advance();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Roll the Dice</h2>
            <DiceRoller onBarbarianRoll={handleBarbarianRoll} />
          </div>
          <BarbarianTracker ref={barbarianTrackerRef} />
          <GameEvents />
        </div>
      </div>
    </main>
  );
}