import React from 'react';
import type { GameEvent } from '@/types/events';

interface EventStatsProps {
  events: GameEvent[];
}

export const EventStats: React.FC<EventStatsProps> = ({ events }) => {
  // Calculate stats
  const categoryStats = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeStats = events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Event Statistics</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">By Category</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex justify-between">
                <span className="capitalize">{category}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">By Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(typeStats).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="capitalize">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Events: {events.length}
        </div>
      </div>
    </div>
  );
};

export default EventStats;