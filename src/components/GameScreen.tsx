import React, { useCallback } from 'react';
import Header from '@/components/Header';
import { DiceRoller } from '@/components/DiceRoller';
import { BarbarianTracker, type BarbarianTrackerRef } from '@/components/BarbarianTracker';
import { GameEvents, type GameEventsRef } from '@/components/GameEvents';
import type { Player, PlayerStatistics } from '@/types/playerTypes';
import { PLAYER_COLORS } from '@/types/playerTypes';
import { ChevronRight, User, Crown, Award } from 'lucide-react';
import type { DiceRoll } from '@/types/diceTypes';

interface GameScreenProps {
  players: Player[];
  currentPlayerIndex: number;
  onNextTurn: () => void;
  onUpdateStatistics: (playerId: string, updates: Partial<PlayerStatistics>) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  players,
  currentPlayerIndex,
  onNextTurn,
  onUpdateStatistics,
}) => {
  const barbarianTrackerRef = React.useRef<BarbarianTrackerRef>(null);
  const gameEventsRef = React.useRef<GameEventsRef>(null);
  const currentPlayer = players[currentPlayerIndex];
  const colorStyles = PLAYER_COLORS[currentPlayer.color];

  const handleDiceRoll = useCallback((roll: DiceRoll) => {
    // Update player statistics
    onUpdateStatistics(currentPlayer.id, {
      rollCount: currentPlayer.statistics.rollCount + 1,
      totalPips: currentPlayer.statistics.totalPips + roll.sum,
    });

    // Check for barbarian
    if (roll.specialDie === 'barbarian') {
      barbarianTrackerRef.current?.advance();
    }

    // Check for random events
    gameEventsRef.current?.checkForEvent();
  }, [currentPlayer, onUpdateStatistics]);

  const handleNextTurn = useCallback(() => {
    onNextTurn();
  }, [onNextTurn]);

  const renderPlayerList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Crown className="text-yellow-500" />
        Players
      </h2>
      <div className="space-y-2">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const colors = PLAYER_COLORS[player.color];

          return (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-2 rounded-lg
                ${isCurrentPlayer ? `${colors.bg} text-white` : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                {isCurrentPlayer && <ChevronRight size={16} />}
                <User size={16} />
                <span>{player.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm opacity-75">
                  Rolls: {player.statistics.rollCount}
                </div>
                <div className="text-sm opacity-75">
                  Avg: {player.statistics.rollCount > 0 
                    ? (player.statistics.totalPips / player.statistics.rollCount).toFixed(1)
                    : '0.0'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {renderPlayerList()}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Roll the Dice</h2>
              <div className={`px-3 py-1 rounded-full ${colorStyles.bg} text-white flex items-center gap-2`}>
                <User size={16} />
                {currentPlayer.name}
                's Turn
              </div>
            </div>
            <DiceRoller onRoll={handleDiceRoll} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNextTurn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                End Turn
              </button>
            </div>
          </div>

          <BarbarianTracker ref={barbarianTrackerRef} />
          <GameEvents ref={gameEventsRef} />
        </div>
      </div>
    </main>
  );
};