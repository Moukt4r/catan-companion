import { useCallback, useRef } from 'react';

export const useSound = (soundUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    }
    
    // Reset and play
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Ignore autoplay errors
    });
  }, [soundUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return { play, stop };
};