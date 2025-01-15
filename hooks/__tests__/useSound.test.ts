import { renderHook } from '@testing-library/react';
import { useSound } from '../useSound';

// Mock Audio
const mockPlay = jest.fn().mockImplementation(() => Promise.resolve());
const mockPause = jest.fn();

class MockAudio {
  currentTime: number = 0;
  play = mockPlay;
  pause = mockPause;

  constructor(public src: string) {}
}

// Replace global Audio with mock
(global as any).Audio = MockAudio;

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
    
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should reuse audio instance on multiple plays', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    result.current.play();
    
    expect(MockAudio as jest.Mock).toHaveBeenCalledTimes(1);
  });

  it('should reset currentTime on play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    
    const audioInstance = (MockAudio as jest.Mock).mock.instances[0];
    expect(audioInstance.currentTime).toBe(0);
  });

  it('should stop sound when stop is called', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.play();
    result.current.stop();
    
    const audioInstance = (MockAudio as jest.Mock).mock.instances[0];
    expect(mockPause).toHaveBeenCalled();
    expect(audioInstance.currentTime).toBe(0);
  });

  it('should handle play errors gracefully', async () => {
    const error = new Error('Autoplay prevented');
    mockPlay.mockRejectedValueOnce(error);
    
    const { result } = renderHook(() => useSound('test.mp3'));
    
    await expect(result.current.play()).resolves.toBeUndefined();
  });

  it('should do nothing when stop is called before play', () => {
    const { result } = renderHook(() => useSound('test.mp3'));
    
    result.current.stop();
    
    expect(mockPause).not.toHaveBeenCalled();
  });
});