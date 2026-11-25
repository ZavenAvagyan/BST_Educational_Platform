import { useCallback, useEffect, useState } from 'react';
import type { OperationStep } from '../types/bst.types';

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

const BASE_INTERVAL_MS = 1050;

export function usePlayback(steps: OperationStep[], autoPlayOnChange = true) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const totalSteps = steps.length;
  const maxIndex = Math.max(0, totalSteps - 1);
  const safeIndex = Math.min(currentIndex, maxIndex);
  const currentStep = steps[safeIndex] ?? null;

  const isAtStart = safeIndex === 0;
  const isAtEnd = safeIndex >= maxIndex;

  // Reset and optionally auto-play whenever a new steps sequence arrives
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(autoPlayOnChange && steps.length > 1);
  }, [steps, autoPlayOnChange]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || totalSteps <= 1) return;

    if (safeIndex >= maxIndex) {
      setIsPlaying(false);
      return;
    }

    const delay = Math.round(BASE_INTERVAL_MS / speed);
    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) {
          setIsPlaying(false);
          return maxIndex;
        }
        return prev + 1;
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [isPlaying, safeIndex, maxIndex, speed, totalSteps]);

  const play = useCallback(() => {
    if (totalSteps <= 1) return;
    if (safeIndex >= maxIndex) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [totalSteps, safeIndex, maxIndex]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const next = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      setIsPlaying(false);
      setCurrentIndex(Math.max(0, Math.min(maxIndex, index)));
    },
    [maxIndex]
  );

  const replay = useCallback(() => {
    setCurrentIndex(0);
    if (totalSteps > 1) {
      setIsPlaying(true);
    }
  }, [totalSteps]);

  return {
    currentIndex: safeIndex,
    totalSteps,
    currentStep,
    isPlaying,
    speed,
    isAtStart,
    isAtEnd,
    setSpeed,
    play,
    pause,
    togglePlay,
    next,
    prev,
    goToStep,
    replay,
  };
}
