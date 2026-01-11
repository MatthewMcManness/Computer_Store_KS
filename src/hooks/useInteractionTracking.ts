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
 * Calculate statistical variance of a numeric array.
 *
 * Used to measure timing irregularity in user interactions. Human behavior
 * has natural variance (irregular timing), while bots often have uniform timing.
 *
 * @param numbers - Array of numbers to calculate variance for
 * @returns Variance value (0 if fewer than 2 numbers)
 *
 * @sideEffects None - pure calculation
 *
 * @example
 * ```ts
 * const timings = [100, 150, 200, 180, 130]; // ms between interactions
 * const variance = calculateVariance(timings);
 * // Higher variance = more human-like (irregular timing)
 * ```
 *
 * @functions_called Math.pow, Array methods
 * @called_by useInteractionTracking hook
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
 */
function calculateVariance(numbers: number[]): number {
  if (numbers.length < 2) return 0;

  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Custom hook for tracking user interactions to distinguish humans from bots.
 *
 * Monitors various types of user interactions and their timing patterns to build
 * a behavioral profile. Humans exhibit irregular timing and multiple interaction
 * types, while bots typically have uniform timing and limited interaction diversity.
 *
 * Tracked interactions:
 * - Mouse movements (throttled to max 10/second)
 * - Clicks
 * - Keystrokes
 * - Scroll events
 * - Focus events
 * - Timing variance between interactions
 *
 * The hook calculates a "human score" based on these behaviors and provides
 * a corresponding spam score (inverse relationship).
 *
 * @returns Object containing:
 *   - getInteractionScore: Function returning detailed scoring analysis with human-likeness assessment
 *   - getInteractionData: Function returning raw interaction counts and timings
 *
 * @sideEffects
 * - Attaches global event listeners on mount (mousemove, click, keydown, scroll, focus)
 * - Stores interaction data in ref (persists across renders)
 * - Removes all event listeners on unmount
 * - Mouse movement tracking is throttled to prevent excessive data collection
 *
 * @example
 * ```tsx
 * const ContactForm = () => {
 *   const { getInteractionScore } = useInteractionTracking();
 *
 *   const handleSubmit = () => {
 *     const { isHumanLike, spamScore, details } = getInteractionScore();
 *
 *     if (!isHumanLike) {
 *       console.log('Bot detected', details);
 *       return;
 *     }
 *
 *     const formData = {
 *       ...fields,
 *       interactionScore: spamScore
 *     };
 *
 *     // Server validates spamScore threshold
 *     submitForm(formData);
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * };
 * ```
 *
 * @functions_called useRef, useEffect, useCallback (React), calculateVariance,
 *                    document.addEventListener/removeEventListener
 * @called_by ContactForm, forms with comprehensive bot protection
 *
 * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
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

  /**
   * Calculate interaction-based bot detection score.
   *
   * Analyzes tracked interactions to determine if behavior appears human-like.
   * Checks for 6 indicators of human behavior and converts to a spam score.
   *
   * Scoring thresholds:
   * - 0-2 indicators = 20 spam points (likely bot)
   * - 3-4 indicators = 10 spam points (suspicious)
   * - 5-6 indicators = 0 spam points (human-like)
   *
   * @returns InteractionScore object with score, human-like flag, spam score, and detailed breakdown
   *
   * @functions_called calculateVariance
   * @called_by Form submission handlers
   *
   * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
   */
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

  /**
   * Get raw interaction data for debugging or analysis.
   *
   * Returns a copy of all tracked interaction counts and timestamps.
   * Useful for logging or detailed bot detection analysis.
   *
   * @returns InteractionData object with counts and timing array
   *
   * @functions_called None (reads ref state)
   * @called_by Debug tools, analytics, detailed bot analysis
   *
   * @version 1.0.0 - 2026-01-11T15:21:39Z - Initial implementation
   */
  const getInteractionData = useCallback((): InteractionData => {
    return { ...interactions.current };
  }, []);

  return {
    getInteractionScore,
    getInteractionData,
  };
}
