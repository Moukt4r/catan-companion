import React, { lazy, Suspense, useState, useCallback, useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import { DiceDisplay } from './DiceDisplay';
import { LoadingSpinner } from './LoadingSpinner';
import { useAnnouncer } from '../hooks/useAnnouncer';

// Lazy load modals
const SettingsModal = lazy(() => import('./modals/SettingsModal'));
const StatisticsModal = lazy(() => import('./modals/StatisticsModal'));
const ConfirmationDialog = lazy(() => import('./modals/ConfirmationDialog'));

export const DiceRoller: React.FC = () => {
  const { state, actions } = useGameState();
  const announcer = useAnnouncer();
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});

  const handleRoll = useCallback(async () => {
    const result = await actions.roll();
    announcer.announce(`Rolled ${result.sum}${
      result.specialDie ? ` with ${result.specialDie} on special die` : ''
    }`);
  }, [actions, announcer]);

  const handleReset = useCallback(() => {
    setConfirmationAction(() => actions.reset);
    setShowConfirmation(true);
  }, [actions]);

  // Memoize heavy calculations
  const statistics = useMemo(() => {
    return {
      averageRoll: state.statistics.totalPips / state.statistics.rollCount || 0,
      mostCommonRoll: Object.entries(state.statistics.numbersRolled)
        .reduce((a, b) => (b[1] > a[1] ? b : a), ['0', 0])[0],
      rollsPerHour: state.statistics.rollCount / 
        ((Date.now() - state.statistics.lastUpdated) / 3600000)
    };
  }, [state.statistics]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        handleRoll();
      } else if (e.key === 'Escape') {
        setShowSettings(false);
        setShowStats(false);
        setShowConfirmation(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRoll]);

  return (
    <div className="p-6 space-y-6" role="main">
      {/* ... rest of the component ... */}
      
      <Suspense fallback={<LoadingSpinner />}>
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
        
        {showStats && (
          <StatisticsModal
            isOpen={showStats}
            onClose={() => setShowStats(false)}
            statistics={statistics}
          />
        )}
        
        {showConfirmation && (
          <ConfirmationDialog
            isOpen={showConfirmation}
            onConfirm={() => {
              confirmationAction();
              setShowConfirmation(false);
            }}
            onCancel={() => setShowConfirmation(false)}
            title="Confirm Reset"
            message="Are you sure you want to reset? This action cannot be undone."
          />
        )}
      </Suspense>

      {/* Announcement region for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        className="sr-only"
      >
        {state.lastAnnouncement}
      </div>
    </div>
  );
};