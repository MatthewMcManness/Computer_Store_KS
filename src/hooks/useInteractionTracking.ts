'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Interaction tracking data
 */
export interface InteractionData {
  mouseMovements: number;
  clicks: number;
  keystrokes: number;
  scrolls: number;
  focusEvents: number;
  /** Timestamps of interactions for variance calculation */
  timings: number[];
}

/**
 * Interaction score result
 */
export interface InteractionScore {
  /** Score from 0-6 (number of human-like behaviors detected) */
  score: number;
  /** Maximum possible score */
  maxScore: number;
  /** Whether behavior appears human-like */
  isHumanLike: boolean;
  /** Spam score contribution (0-20, inverse of human score) */
  spamScore: number;
  /** Detailed breakdown */
  details: {
    hasMouseMovement: boolean;
    hasClicks: boolean;
    hasKeystrokes: boolean;
    hasScrolls: boolean;
    hasFocusEvents: boolean;
    hasNaturalVariance: boolean;
  };
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length < 2) return 0;

  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Hook to track user interactions for bot detection
 *
 * Tracks:
 * - Mouse movements
 * - Clicks
 * - Keystrokes
 * - Scrolls
 * - Focus events
 * - Timing variance (humans have irregular patterns)
 *
 * @returns Object with getInteractionScore function and raw interaction data
 */
export function useInteractionTracking() {
  const interactions = useRef<InteractionData>({
    mouseMovements: 0,
    clicks: 0,
    keystrokes: 0,
    scrolls: 0,
    focusEvents: 0,
    timings: [],
  });

  useEffect(() => {
    const trackMouse = () => {
      interactions.current.mouseMovements++;
      interactions.current.timings.push(Date.now());
    };

    const trackClick = () => {
      interactions.current.clicks++;
      interactions.current.timings.push(Date.now());
    };

    const trackKeypress = () => {
      interactions.current.keystrokes++;
      interactions.current.timings.push(Date.now());
    };

    const trackScroll = () => {
      interactions.current.scrolls++;
      interactions.current.timings.push(Date.now());
    };

    const trackFocus = () => {
      interactions.current.focusEvents++;
    };

    // Throttle mouse movement tracking to avoid excessive data
    let lastMouseTime = 0;
    const throttledMouseTrack = () => {
      const now = Date.now();
      if (now - lastMouseTime > 100) { // Max 10 events per second
        lastMouseTime = now;
        trackMouse();
      }
    };

    document.addEventListener('mousemove', throttledMouseTrack);
    document.addEventListener('click', trackClick);
    document.addEventListener('keydown', trackKeypress);
    document.addEventListener('scroll', trackScroll);
    window.addEventListener('focus', trackFocus);

    return () => {
      document.removeEventListener('mousemove', throttledMouseTrack);
      document.removeEventListener('click', trackClick);
      document.removeEventListener('keydown', trackKeypress);
      document.removeEventListener('scroll', trackScroll);
      window.removeEventListener('focus', trackFocus);
    };
  }, []);

  const getInteractionScore = useCallback((): InteractionScore => {
    const { mouseMovements, clicks, keystrokes, scrolls, focusEvents, timings } = interactions.current;

    // Human behavior indicators
    const hasMouseMovement = mouseMovements > 5;
    const hasClicks = clicks > 0;
    const hasKeystrokes = keystrokes > 5;
    const hasScrolls = scrolls > 0;
    const hasFocusEvents = focusEvents > 0;

    // Timing variance (humans have irregular patterns)
    // Calculate intervals between events
    const intervals: number[] = [];
    for (let i = 1; i < timings.length && i < 50; i++) {
      const curr = timings[i];
      const prev = timings[i - 1];
      if (curr !== undefined && prev !== undefined) {
        intervals.push(curr - prev);
      }
    }
    const variance = calculateVariance(intervals);
    const hasNaturalVariance = variance > 1000; // More than 1 second variance

    const humanIndicators = [
      hasMouseMovement,
      hasClicks,
      hasKeystrokes,
      hasScrolls,
      hasFocusEvents,
      hasNaturalVariance,
    ];

    const score = humanIndicators.filter(Boolean).length;
    const isHumanLike = score >= 3;

    // Convert to spam score (inverse - low human score = high spam score)
    // 0-2 human indicators = 20 spam points
    // 3-4 human indicators = 10 spam points
    // 5-6 human indicators = 0 spam points
    let spamScore = 0;
    if (score <= 2) {
      spamScore = 20;
    } else if (score <= 4) {
      spamScore = 10;
    }

    return {
      score,
      maxScore: 6,
      isHumanLike,
      spamScore,
      details: {
        hasMouseMovement,
        hasClicks,
        hasKeystrokes,
        hasScrolls,
        hasFocusEvents,
        hasNaturalVariance,
      },
    };
  }, []);

  const getInteractionData = useCallback((): InteractionData => {
    return { ...interactions.current };
  }, []);

  return {
    getInteractionScore,
    getInteractionData,
  };
}
