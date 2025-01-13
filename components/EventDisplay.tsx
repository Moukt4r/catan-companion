import React, { useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { X, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import type { GameEvent } from '../types/eventTypes';

interface EventDisplayProps {
  event: GameEvent;
  onClose: () => void;
  autoDismissAfter?: number; // milliseconds
}

const getEventStyles = (type: GameEvent['type']): string => {
  switch (type) {
    case 'positive':
      return 'border-green-500 bg-green-50';
    case 'negative':
      return 'border-red-500 bg-red-50';
    case 'neutral':
      return 'border-blue-500 bg-blue-50';
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

const getSeverityLabel = (severity: GameEvent['severity']): string => {
  switch (severity) {
    case 'low': return 'Minor Effect';
    case 'medium': return 'Moderate Effect';
    case 'high': return 'Major Effect';
  }
};

export const EventDisplay: React.FC<EventDisplayProps> = ({ 
  event, 
  onClose, 
  autoDismissAfter 
}) => {
  useEffect(() => {
    if (autoDismissAfter) {
      const timer = setTimeout(onClose, autoDismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismissAfter, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`${event.type} event notification`}
      className="animate-slide-in-down"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Alert 
        className={`relative mb-4 transform transition-all duration-300 ${getEventStyles(event.type)}`}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close event notification"
        >
          <X size={16} />
        </button>
        
        <AlertTitle className="text-lg font-semibold flex items-center">
          {getEventIcon(event.type)}
          {event.title}
        </AlertTitle>
        
        <AlertDescription className="mt-2 space-y-2">
          <p>{event.description}</p>
          <div className="text-sm text-gray-600 flex items-center justify-between">
            <span>{getSeverityLabel(event.severity)}</span>
            {event.duration && (
              <span>Duration: {event.duration} {event.duration === 1 ? 'round' : 'rounds'}</span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};