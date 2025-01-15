import { renderHook, act } from '@testing-library/react';
import { useAnnouncer } from '../useAnnouncer';

describe('useAnnouncer', () => {
  beforeEach(() => {
    // Clean up any announcer elements before each test
    document.body.innerHTML = '';
  });

  it('should create an announcer element with default options', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Test message');
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toBeTruthy();
    expect(announcer?.getAttribute('aria-live')).toBe('polite');
    expect(announcer?.textContent).toBe('Test message');
    expect(announcer?.className).toBe('sr-only');
  });

  it('should create an announcer element with custom politeness', () => {
    const { result } = renderHook(() => useAnnouncer({ politeness: 'assertive' }));

    act(() => {
      result.current.announce('Test message');
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer?.getAttribute('aria-live')).toBe('assertive');
  });

  it('should clear announcement after specified delay', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useAnnouncer({ clearAfter: 1000 }));

    act(() => {
      result.current.announce('Test message');
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer?.textContent).toBe('Test message');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(announcer?.textContent).toBe('');

    jest.useRealTimers();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Test message');
    });

    act(() => {
      unmount();
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer).toBeFalsy();
  });

  it('should handle multiple announcements', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('First message');
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer?.textContent).toBe('First message');

    act(() => {
      result.current.announce('Second message');
    });

    expect(announcer?.textContent).toBe('Second message');
  });

  it('should handle assertive announcements', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announceAssertive('Important message');
    });

    const announcer = document.querySelector('[role="status"]');
    expect(announcer?.textContent).toBe('Important message');
  });
});