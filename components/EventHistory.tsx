import React from 'react';
import { X } from 'lucide-react';
import type { EventHistoryEntry } from '../types/eventTypes';

interface EventHistoryProps {
  history: EventHistoryEntry[];
  onClose: () => void;
}

export const EventHistory: React.FC<EventHistoryProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Event History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close history"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={`${entry.event.id}-${entry.timestamp}`}
              className={`p-4 rounded-lg border ${
                entry.dismissed ? 'opacity-50' : ''
              } ${
                entry.event.type === 'positive' ? 'border-green-200 bg-green-50' :
                entry.event.type === 'negative' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="font-semibold">{entry.event.title}</div>
              <div className="text-sm text-gray-600 mt-1">
                {entry.event.description}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No events recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};