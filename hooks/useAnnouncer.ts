import { useCallback, useRef, useEffect } from 'react';

interface AnnouncerOptions {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const useAnnouncer = (options: AnnouncerOptions = {}) => {
  const {
    politeness = 'polite',
    clearAfter = 5000
  } = options;

  const timeoutRef = useRef<number>();
  const announcementRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string) => {
    if (!announcementRef.current) {
      announcementRef.current = document.createElement('div');
      announcementRef.current.setAttribute('role', 'status');
      announcementRef.current.setAttribute('aria-live', politeness);
      announcementRef.current.className = 'sr-only';
      document.body.appendChild(announcementRef.current);
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Update announcement
    announcementRef.current.textContent = message;

    // Clear after delay
    timeoutRef.current = window.setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, clearAfter);
  }, [politeness, clearAfter]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  return {
    announce,
    announceAssertive: useCallback((message: string) => {
      announce(message);
      // Also show visual feedback for important announcements
      // This could be a toast notification or other visual indicator
    }, [announce])
  };
};