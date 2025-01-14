import React, { useState } from 'react';
import { Plus, Minus, User, Users } from 'lucide-react';
import type { Player, PlayerColor } from '@/types/playerTypes';
import { PLAYER_COLORS, createInitialStatistics } from '@/types/playerTypes';

interface StartScreenProps {
  onStartGame: (players: Player[]) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<Partial<Player>[]>(
    Array(4).fill(null).map((_, i) => ({
      name: `Player ${i + 1}`,
      color: Object.keys(PLAYER_COLORS)[i] as PlayerColor
    }))
  );

  const adjustPlayerCount = (delta: number) => {
    const newCount = Math.min(6, Math.max(2, playerCount + delta));
    setPlayerCount(newCount);
    
    if (delta > 0) {
      // Add players
      setPlayers(prev => [
        ...prev,
        ...Array(newCount - prev.length).fill(null).map((_, i) => ({
          name: `Player ${prev.length + i + 1}`,
          color: Object.keys(PLAYER_COLORS)[prev.length + i] as PlayerColor
        }))
      ]);
    } else {
      // Remove players
      setPlayers(prev => prev.slice(0, newCount));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[index] = { ...newPlayers[index], name };
      return newPlayers;
    });
  };

  const updatePlayerColor = (index: number, color: PlayerColor) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[index] = { ...newPlayers[index], color };
      return newPlayers;
    });
  };

  const handleStartGame = () => {
    const finalPlayers = players.map((player, index) => ({
      id: `player-${index + 1}`,
      name: player.name || `Player ${index + 1}`,
      color: player.color || Object.keys(PLAYER_COLORS)[0] as PlayerColor,
      statistics: createInitialStatistics(),
    }));
    onStartGame(finalPlayers);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start New Game
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up your Catan Cities & Knights game
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Players:</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => adjustPlayerCount(-1)}
                disabled={playerCount <= 2}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={20} />
              </button>
              <span className="font-medium text-lg w-4 text-center">{playerCount}</span>
              <button
                onClick={() => adjustPlayerCount(1)}
                disabled={playerCount >= 6}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-4">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={player.color}
                  onChange={(e) => updatePlayerColor(index, e.target.value as PlayerColor)}
                  className={`w-24 px-3 py-2 border rounded-lg ${PLAYER_COLORS[player.color as PlayerColor].bg} text-white`}
                >
                  {Object.entries(PLAYER_COLORS).map(([color]) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartGame}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
            text-white font-medium rounded-lg shadow transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
};