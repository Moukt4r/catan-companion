export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
}

export const EVENTS: GameEvent[] = [
  {
    id: 'earthquake',
    title: 'Earthquake!',
    description: 'All players must remove one road from their network.',
    type: 'negative'
  },
  {
    id: 'good_harvest',
    title: 'Good Harvest',
    description: 'Each player receives one resource of their choice.',
    type: 'positive'
  },
  {
    id: 'trade_winds',
    title: 'Trade Winds',
    description: 'Maritime trade costs are reduced by 1 for the next round.',
    type: 'positive'
  },
  {
    id: 'pirates',
    title: 'Pirates!',
    description: 'Players with more than 7 cards must discard one resource.',
    type: 'negative'
  },
  {
    id: 'market_day',
    title: 'Market Day',
    description: 'All players may make one 2:1 trade with the bank.',
    type: 'positive'
  },
  {
    id: 'storm',
    title: 'Storm',
    description: 'No maritime trade allowed for one round.',
    type: 'negative'
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Draw one development card at half cost.',
    type: 'positive'
  },
  {
    id: 'rebellion',
    title: 'Rebellion',
    description: 'Longest road is temporarily broken - no bonus points this round.',
    type: 'negative'
  },
  {
    id: 'festival',
    title: 'Festival',
    description: 'Each player with a city receives one free resource.',
    type: 'positive'
  },
  {
    id: 'drought',
    title: 'Drought',
    description: 'Fields produce no grain this round.',
    type: 'negative'
  },
  {
    id: 'abundance',
    title: 'Time of Abundance',
    description: 'All resource production is doubled this round.',
    type: 'positive'
  },
  {
    id: 'peace',
    title: 'Peace Treaty',
    description: 'Robber cannot be moved this round.',
    type: 'positive'
  },
  {
    id: 'innovation',
    title: 'Innovation',
    description: 'First city upgrade this round costs 1 less resource.',
    type: 'positive'
  },
  {
    id: 'epidemic',
    title: 'Epidemic',
    description: 'Cities produce resources as settlements this round.',
    type: 'negative'
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Each player may upgrade one road for free.',
    type: 'positive'
  },
  {
    id: 'fog',
    title: 'Dense Fog',
    description: 'No robber movement allowed this round.',
    type: 'neutral'
  },
  {
    id: 'windfall',
    title: 'Resource Windfall',
    description: 'Roll one die - all players get that resource.',
    type: 'positive'
  },
  {
    id: 'tax',
    title: 'Tax Collection',
    description: 'Players with more than 5 victory points must give away 1 resource.',
    type: 'negative'
  },
  {
    id: 'fortune',
    title: 'Good Fortune',
    description: 'Next 7 rolled does not trigger robber.',
    type: 'positive'
  },
  {
    id: 'sabotage',
    title: 'Sabotage',
    description: 'Each player must disable one production hex for one round.',
    type: 'negative'
  },
  {
    id: 'celebration',
    title: 'Celebration',
    description: 'Development cards cost 1 less resource this round.',
    type: 'positive'
  },
  {
    id: 'diplomacy',
    title: 'Diplomacy',
    description: 'Players cannot play soldier cards this round.',
    type: 'neutral'
  },
  {
    id: 'creativity',
    title: 'Creative Solutions',
    description: 'Players may use any resource as a wildcard once this round.',
    type: 'positive'
  },
  {
    id: 'raid',
    title: 'Raider Attack',
    description: 'Players with settlements on 6 or 8 lose one resource.',
    type: 'negative'
  },
  {
    id: 'cooperation',
    title: 'Cooperation',
    description: 'All trades between players cost no resources this round.',
    type: 'positive'
  },
  {
    id: 'competition',
    title: 'Competition',
    description: 'No trades between players allowed this round.',
    type: 'negative'
  },
  {
    id: 'wisdom',
    title: 'Ancient Wisdom',
    description: 'Development cards can be played immediately after purchase.',
    type: 'positive'
  },
  {
    id: 'mystical',
    title: 'Mystical Event',
    description: 'Reshuffle all unplayed development cards.',
    type: 'neutral'
  },
  {
    id: 'investment',
    title: 'Investment',
    description: 'Players may buy victory points for 5 resources each.',
    type: 'positive'
  },
  {
    id: 'isolation',
    title: 'Isolation',
    description: 'No new roads can be built this round.',
    type: 'negative'
  }
];