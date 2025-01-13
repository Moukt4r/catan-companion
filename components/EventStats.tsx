import React, { useMemo } from 'react';
import { X, PieChart } from 'lucide-react';
import type { GameEvent, EventType, EventCategory } from '../types/eventTypes';

interface EventStatsProps {
  events: GameEvent[];
  onClose: () => void;
}

interface StatCount {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
}

const categoryLabels: Record<EventCategory, string> = {
  resource: 'Resource Events',
  trade: 'Trade Events',
  development: 'Development Events',
  military: 'Military Events',
  infrastructure: 'Infrastructure Events'
};

export const EventStats: React.FC<EventStatsProps> = ({ events, onClose }) => {
  const stats = useMemo(() => {
    const byCategory = events.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = { total: 0, positive: 0, negative: 0, neutral: 0 };
      }
      acc[event.category].total++;
      acc[event.category][event.type]++;
      return acc;
    }, {} as Record<EventCategory, StatCount>);

    const bySeverity = events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byCategory, bySeverity };
  }, [events]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Event Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close statistics"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Category breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Events by Category</h3>
            <div className="grid gap-4">
              {Object.entries(stats.byCategory).map(([category, counts]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">{categoryLabels[category as EventCategory]}</div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
                    <div className="text-blue-600">Total: {counts.total}</div>
                    <div className="text-green-600">Positive: {counts.positive}</div>
                    <div className="text-red-600">Negative: {counts.negative}</div>
                    <div className="text-gray-600">Neutral: {counts.neutral}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Events by Severity</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.bySeverity).map(([severity, count]) => (
                <div key={severity} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="font-medium capitalize">{severity}</div>
                  <div className="text-2xl font-bold mt-1">{count}</div>
                  <div className="text-sm text-gray-500">
                    ({((count / events.length) * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};