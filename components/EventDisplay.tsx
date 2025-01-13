import React from 'react';
import Alert, { AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import type { GameEvent } from '../types/eventTypes';

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

const getEventIcon = (type: GameEvent['type']) => {
  const props = { className: 'inline-block mr-2', size: 18 };
  switch (type) {
    case 'positive':
      return <ThumbsUp {...props} className={`${props.className} text-green-600`} />;
    case 'negative':
      return <ThumbsDown {...props} className={`${props.className} text-red-600`} />;
    case 'neutral':
      return <AlertCircle {...props} className={`${props.className} text-blue-600`} />;
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
      <AlertTitle>
        {getEventIcon(event.type)}
        {event.title}
      </AlertTitle>
      <AlertDescription>
        {event.description}
      </AlertDescription>
    </Alert>
  );
};