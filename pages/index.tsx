import Header from '@/components/Header';
import { DiceRoller } from '@/components/DiceRoller';

export default function Home() {
  return (
    <main>
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl mb-4">Roll the Dice</h2>
          <DiceRoller />
        </div>
      </div>
    </main>
  );
}