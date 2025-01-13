import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X } from 'lucide-react';
import type { GameEvent } from '../utils/events';

interface EventDisplayProps {
  event: GameEvent;
  onClose: () => void;
}

const getEventStyles = (type: GameEvent['type']): string => {
  switch (type) {
    case 'positive':
      return 'border-green-500 bg-green-50';
    case 'negative':
      return 'border-red-500 bg-red-50';
    case 'neutral':
      return 'border-blue-500 bg-blue-50';
    default:
      return '';
  }
};

export const EventDisplay: React.FC<EventDisplayProps> = ({ event, onClose }) => {
  return (
    <Alert className={`relative mb-4 ${getEventStyles(event.type)}`}>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        aria-label="Close event notification"
      >
        <X size={16} />
      </button>
      <AlertTitle className="text-lg font-semibold">{event.title}</AlertTitle>
      <AlertDescription className="text-sm mt-1">
        {event.description}
      </AlertDescription>
    </Alert>
  );
};