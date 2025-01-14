export type SpecialDieFace = 'barbarian' | 'merchant' | 'politics' | 'science';

export interface DiceRoll {
  dice1: number;
  dice2: number;
  sum: number;
  specialDie?: SpecialDieFace;
}

interface SpecialDieInfo {
  color: string;
  icon: string;
  label: string;
}

export const SPECIAL_DIE_INFO: Record<SpecialDieFace, SpecialDieInfo> = {
  barbarian: {
    color: 'bg-red-500',
    icon: '⚔️',
    label: 'Barbarian'
  },
  politics: {
    color: 'bg-green-500',
    icon: '👑',
    label: 'Politics'
  },
  science: {
    color: 'bg-blue-500',
    icon: '🧪',
    label: 'Science'
  },
  merchant: {
    color: 'bg-yellow-400',
    icon: '💰',
    label: 'Merchant'
  }
} as const;