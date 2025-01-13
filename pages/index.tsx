import { Header } from '@/components/Header';

export default function Home() {
  return (
    <main>
      <Header />
      <div className="container mx-auto p-4">
        <h2 className="text-xl">Welcome to Catan Companion</h2>
      </div>
    </main>
  );
}