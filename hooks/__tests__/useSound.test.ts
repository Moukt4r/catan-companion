import { renderHook } from '@testing-library/react';
import { useSound } from '../useSound';

const mockPlay = jest.fn().mockImplementation(() => Promise.resolve());
const mockPause = jest.fn();

// Mock Audio implementation
const mockAudio = jest.fn().mockImplementation((url: string) => ({
  currentTime: 0,
  play: mockPlay,
  pause: mockPause
}));

// Replace global Audio
global.Audio = mockAudio;

describe('useSound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    
    expect(mockAudio).toHaveBeenCalledWith('test.mp3');
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should reuse audio instance on multiple plays', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    result.current.play();
    
    expect(mockAudio).toHaveBeenCalledTimes(1);
  });

  it('should reset currentTime on play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    const audio = mockAudio.mock.results[0].value;
    
    audio.currentTime = 10;
    result.current.play();
    
    expect(audio.currentTime).toBe(0);
  });

  it('should stop sound when stop is called', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    const audio = mockAudio.mock.results[0].value;
    
    result.current.play();
    result.current.stop();
    
    expect(mockPause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('should handle play errors gracefully', async () => {
    mockPlay.mockRejectedValueOnce(new Error('Autoplay prevented'));
    
    const { result } = renderHook(() => useSound('test.mp3'));
    
    // Should not throw
    await result.current.play();
  });

  it('should do nothing when stop is called before play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.stop();
    
    expect(mockPause).not.toHaveBeenCalled();
  });
});