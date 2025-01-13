import type { SpecialDieFace } from './diceTypes';

export interface GameStatistics {
  rollCount: number;
  totalPips: number;
  numbersRolled: Record<number, number>;
  specialFacesRolled: Partial<Record<SpecialDieFace, number>>;
  eventsTriggered: number;
  barbarianAttacks: number;
  lastUpdated: number;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastNumber: number | null;
  };
  probabilities: {
    actual: Record<number, number>;
    expected: Record<number, number>;
  };
}

export class StatisticsTracker {
  private stats: GameStatistics;

  constructor(initialStats?: Partial<GameStatistics>) {
    this.stats = {
      rollCount: 0,
      totalPips: 0,
      numbersRolled: {},
      specialFacesRolled: {},
      eventsTriggered: 0,
      barbarianAttacks: 0,
      lastUpdated: Date.now(),
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastNumber: null
      },
      probabilities: {
        actual: {},
        expected: this.calculateExpectedProbabilities()
      },
      ...initialStats
    };
  }

  private calculateExpectedProbabilities(): Record<number, number> {
    const probabilities: Record<number, number> = {};
    // Calculate probability for each possible sum (2-12)
    for (let i = 2; i <= 12; i++) {
      const ways = Math.min(i - 1, 13 - i);
      probabilities[i] = ways / 36;
    }
    return probabilities;
  }

  public recordRoll(roll: { dice1: number; dice2: number; specialDie?: SpecialDieFace }): void {
    const sum = roll.dice1 + roll.dice2;
    
    // Update basic stats
    this.stats.rollCount++;
    this.stats.totalPips += sum;
    this.stats.numbersRolled[sum] = (this.stats.numbersRolled[sum] || 0) + 1;
    
    // Update streaks
    if (this.stats.streaks.lastNumber === sum) {
      this.stats.streaks.currentStreak++;
      this.stats.streaks.longestStreak = Math.max(
        this.stats.streaks.longestStreak,
        this.stats.streaks.currentStreak
      );
    } else {
      this.stats.streaks.currentStreak = 1;
    }
    this.stats.streaks.lastNumber = sum;

    // Update special die stats
    if (roll.specialDie) {
      this.stats.specialFacesRolled[roll.specialDie] = 
        (this.stats.specialFacesRolled[roll.specialDie] || 0) + 1;
    }

    // Update actual probabilities
    Object.keys(this.stats.numbersRolled).forEach(num => {
      this.stats.probabilities.actual[num] = 
        this.stats.numbersRolled[num] / this.stats.rollCount;
    });

    this.stats.lastUpdated = Date.now();
  }

  public recordEvent(): void {
    this.stats.eventsTriggered++;
    this.stats.lastUpdated = Date.now();
  }

  public recordBarbarianAttack(): void {
    this.stats.barbarianAttacks++;
    this.stats.lastUpdated = Date.now();
  }

  public getStatistics(): GameStatistics {
    return { ...this.stats };
  }

  public getNumberFrequency(number: number): number {
    return this.stats.numbersRolled[number] || 0;
  }

  public getMostFrequentNumber(): number | null {
    const entries = Object.entries(this.stats.numbersRolled);
    if (entries.length === 0) return null;
    
    return Number(entries.reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0]);
  }

  public getAveragePips(): number {
    return this.stats.rollCount > 0 
      ? this.stats.totalPips / this.stats.rollCount 
      : 0;
  }

  public reset(): void {
    this.stats = new StatisticsTracker().getStatistics();
  }
}