import { renderHook } from '@testing-library/react';
import { useSound } from '../useSound';

let mockAudioInstance = {
  currentTime: 0,
  play: jest.fn().mockImplementation(() => Promise.resolve()),
  pause: jest.fn()
};

// Mock Audio implementation
const mockAudioConstructor = jest.fn().mockImplementation((url: string) => {
  mockAudioInstance.currentTime = 0;
  return mockAudioInstance;
});

// Replace global Audio
global.Audio = mockAudioConstructor;

describe('useSound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudioInstance.currentTime = 0;
  });

  it('should create a sound hook with play and stop methods', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    expect(result.current).toHaveProperty('play');
    expect(result.current).toHaveProperty('stop');
    expect(typeof result.current.play).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });

  it('should initialize audio on first play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    
    expect(mockAudioConstructor).toHaveBeenCalledWith('test.mp3');
    expect(mockAudioInstance.play).toHaveBeenCalled();
  });

  it('should reuse audio instance on multiple plays', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    result.current.play();
    
    expect(mockAudioConstructor).toHaveBeenCalledTimes(1);
  });

  it('should reset currentTime on play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    mockAudioInstance.currentTime = 10;
    result.current.play();
    
    expect(mockAudioInstance.currentTime).toBe(0);
  });

  it('should stop sound when stop is called', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    result.current.stop();
    
    expect(mockAudioInstance.pause).toHaveBeenCalled();
    expect(mockAudioInstance.currentTime).toBe(0);
  });

  it('should handle play errors gracefully', async () => {
    const error = new Error('Autoplay prevented');
    mockAudioInstance.play.mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useSound('test.mp3'));
    
    // Should not throw
    await result.current.play();
  });

  it('should do nothing when stop is called before play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.stop();
    
    expect(mockAudioInstance.pause).not.toHaveBeenCalled();
  });
});