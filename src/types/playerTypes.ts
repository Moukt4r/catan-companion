export interface Player {
  id: string;
  name: string;
  color: string;
  statistics: PlayerStatistics;
}

export interface PlayerStatistics {
  // Resource-related stats
  resourcesGained: number;
  resourcesTraded: number;
  
  // Development-related stats
  knightsPlayed: number;
  citiesBuilt: number;
  settlementsBuilt: number;
  roadsBuilt: number;
  
  // Cities & Knights specific
  barbarianDefenses: number;
  politicsCardCount: number;
  scienceCardCount: number;
  tradeCardCount: number;
  
  // Game stats
  turnCount: number;
  rollCount: number;
  totalPips: number;
}

export const PLAYER_COLORS = {
  red: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    hover: 'hover:bg-red-600',
  },
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    hover: 'hover:bg-blue-600',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    hover: 'hover:bg-orange-600',
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    hover: 'hover:bg-green-600',
  },
  white: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
    hover: 'hover:bg-gray-200',
  },
  brown: {
    bg: 'bg-amber-800',
    text: 'text-amber-800',
    border: 'border-amber-800',
    hover: 'hover:bg-amber-900',
  },
} as const;

export type PlayerColor = keyof typeof PLAYER_COLORS;

export const createInitialStatistics = (): PlayerStatistics => ({
  resourcesGained: 0,
  resourcesTraded: 0,
  knightsPlayed: 0,
  citiesBuilt: 0,
  settlementsBuilt: 0,
  roadsBuilt: 0,
  barbarianDefenses: 0,
  politicsCardCount: 0,
  scienceCardCount: 0,
  tradeCardCount: 0,
  turnCount: 0,
  rollCount: 0,
  totalPips: 0,
});