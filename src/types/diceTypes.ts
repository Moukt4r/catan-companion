export type SpecialDieFace = 'barbarian' | 'merchant' | 'politics' | 'science' | 'trade' | 'none';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

export const SPECIAL_DIE_COLORS = {
  barbarian: 'bg-red-500',
  merchant: 'bg-yellow-400',
  politics: 'bg-purple-500',
  science: 'bg-green-500',
  trade: 'bg-blue-500',
  none: 'bg-gray-300',
} as const;

export const SPECIAL_DIE_ICONS = {
  barbarian: '⚔️',
  merchant: '💰',
  politics: '👑',
  science: '🧪',
  trade: '🔄',
  none: '⚪',
} as const;