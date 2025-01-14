export type SpecialDieFace = 'barbarian' | 'merchant' | 'politics' | 'science';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

export const SPECIAL_DIE_COLORS = {
  barbarian: 'bg-red-500',
  merchant: 'bg-yellow-400',
  politics: 'bg-green-500',
  science: 'bg-blue-500',
} as const;

export const SPECIAL_DIE_ICONS = {
  barbarian: '⚔️', // Barbarian (red)
  merchant: '💰', // Merchant (yellow)
  politics: '👑', // Politics (green)
  science: '🧪', // Science (blue)
} as const;