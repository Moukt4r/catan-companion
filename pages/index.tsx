import Header from '@/components/Header';
import { DiceRoller } from '@/components/DiceRoller';
import { BarbarianTracker } from '@/components/BarbarianTracker';
import { useState } from 'react';

export default function Home() {
  const [barbarianTrackerRef, setBarbarianTrackerRef] = useState<{ advance: () => void } | null>(null);

  const handleBarbarianRoll = () => {
    barbarianTrackerRef?.advance();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Roll the Dice</h2>
            <DiceRoller onBarbarianRoll={handleBarbarianRoll} />
          </div>
          <BarbarianTracker ref={(ref) => setBarbarianTrackerRef(ref)} />
        </div>
      </div>
    </main>
  );
}