import { useState } from 'react';
import type { Player } from '@/types/playerTypes';
import { StartScreen } from '@/components/StartScreen';
import { GameScreen } from '@/components/GameScreen';

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const handleStartGame = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setGameStarted(true);
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    // Update player statistics
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[currentPlayerIndex] = {
        ...newPlayers[currentPlayerIndex],
        statistics: {
          ...newPlayers[currentPlayerIndex].statistics,
          turnCount: newPlayers[currentPlayerIndex].statistics.turnCount + 1,
        },
      };
      return newPlayers;
    });
  };

  const updatePlayerStatistics = (playerId: string, updates: Partial<Player['statistics']>) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      const playerIndex = newPlayers.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;

      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        statistics: {
          ...newPlayers[playerIndex].statistics,
          ...updates,
        },
      };
      return newPlayers;
    });
  };

  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

  return (
    <GameScreen
      players={players}
      currentPlayerIndex={currentPlayerIndex}
      onNextTurn={nextTurn}
      onUpdateStatistics={updatePlayerStatistics}
    />
  );
}