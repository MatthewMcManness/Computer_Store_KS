import { test, expect, describe } from 'bun:test';
import {
  calculateSpamScore,
  analyzeContent,
  validateTiming,
  checkHoneypots,
  SPAM_THRESHOLDS,
  type SpamScoreResult,
  type ContentAnalysis,
} from './spam-detection';

// Mock Headers class for testing
class MockHeaders extends Headers {
  private map: Map<string, string>;

  constructor(init: Record<string, string> = {}) {
    super();
    this.map = new Map(Object.entries(init));
  }

  get(name: string): string | null {
    return this.map.get(name.toLowerCase()) || null;
  }
}

describe('Spam Detection Module', () => {
  describe('analyzeContent', () => {
    test('should score legitimate text low', () => {
      const result = analyzeContent('My computer is broken and needs repair help please');
      expect(result.score).toBeLessThan(15);
      expect(result.validWordRatio).toBeGreaterThan(0.5);
      expect(result.entropy).toBeGreaterThan(3.5);
      expect(result.entropy).toBeLessThan(4.7);
    });

    test('should score gibberish text high', () => {
      const result = analyzeContent('xkjsdhfkjhsdkjfhskdjfhksjdhfkjshdf');
      expect(result.score).toBeGreaterThan(10);
      expect(result.validWordRatio).toBeLessThan(0.3);
    });

    test('should detect keyboard walks', () => {
      const result = analyzeContent('qwertyuiop asdfghjkl zxcvbnm');
      expect(result.score).toBeGreaterThan(15);
    });

    test('should handle empty message', () => {
      const result = analyzeContent('');
      expect(result.score).toBe(30);
      expect(result.validWordRatio).toBe(0);
    });
  });

  describe('validateTiming', () => {
    test('should score fast submissions high', () => {
      const now = Date.now();
      const score = validateTiming(now - 500, now);
      expect(score).toBeGreaterThan(10);
    });

    test('should score normal submissions low', () => {
      const now = Date.now();
      const score = validateTiming(now - 5000, now);
      expect(score).toBe(0);
    });

    test('should detect negative time difference', () => {
      const now = Date.now();
      const score = validateTiming(now + 1000, now);
      expect(score).toBe(20);
    });

    test('should handle missing timing data', () => {
      const score = validateTiming(0, 0);
      expect(score).toBe(10);
    });
  });

  describe('checkHoneypots', () => {
    test('should return 0 for empty fields', () => {
      const score = checkHoneypots({});
      expect(score).toBe(0);
    });

    test('should return 50 for filled website field', () => {
      const score = checkHoneypots({ website: 'https://spam.com' });
      expect(score).toBe(50);
    });

    test('should return 50 for filled url field', () => {
      const score = checkHoneypots({ url: 'https://spam.com' });
      expect(score).toBe(50);
    });

    test('should ignore empty honeypot fields', () => {
      const score = checkHoneypots({ website: '', url: '   ' });
      expect(score).toBe(0);
    });
  });

  describe('calculateSpamScore', () => {
    test('should allow legitimate submissions', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Repair',
        message: 'My laptop screen is broken and needs repair. Can you help me fix it?',
        pageLoadTime: Date.now() - 5000,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'en-US,en;q=0.9',
        referer: 'https://example.com/contact',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.score).toBeLessThan(40);
      expect(result.action).toBe('allow');
      expect(result.breakdown.content).toBeLessThan(15);
      expect(result.breakdown.timing).toBe(0);
      expect(result.breakdown.honeypot).toBe(0);
    });

    test('should block gibberish spam', () => {
      const data = {
        name: 'Spammer',
        email: 'spam@example.com',
        subject: 'Other',
        message: 'asdfghjkl qwertyuiop zxcvbnm kjhgfdsa poiuytrewq mnbvcxz',
        pageLoadTime: Date.now() - 1000,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'Mozilla/5.0',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.score).toBeGreaterThan(40);
      expect(result.action).not.toBe('allow');
    });

    test('should detect honeypot and block', () => {
      const data = {
        name: 'Bot',
        email: 'bot@example.com',
        subject: 'General',
        message: 'This is a test message from a bot',
        website: 'https://bot-site.com',
        pageLoadTime: Date.now() - 2000,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'Python/3.9',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.breakdown.honeypot).toBe(50);
      expect(result.action).not.toBe('allow');
    });

    test('should penalize fast submissions', () => {
      const data = {
        name: 'Fast User',
        email: 'fast@example.com',
        subject: 'General',
        message: 'Hello I need help with my computer repair service please contact me',
        pageLoadTime: Date.now() - 500,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'en-US,en;q=0.9',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.breakdown.timing).toBeGreaterThan(10);
    });

    test('should penalize bot user agents', () => {
      const data = {
        name: 'Bot',
        email: 'bot@example.com',
        subject: 'General',
        message: 'Hello I need help with my computer repair',
        pageLoadTime: Date.now() - 5000,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'curl/7.68.0',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.breakdown.fingerprint).toBeGreaterThan(0);
    });

    test('should cap score at 100', () => {
      const data = {
        name: 'Mega Bot',
        email: 'megabot@example.com',
        subject: 'Other',
        message: 'xkjsdhfkjhsdkjfhskdjfhksjdhfkjshdf',
        website: 'https://spam.com',
        pageLoadTime: Date.now() - 100,
        submitTime: Date.now(),
      };
      const headers = new MockHeaders({
        'user-agent': 'bot',
      });

      const result = calculateSpamScore(data, headers);

      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('SPAM_THRESHOLDS', () => {
    test('should have correct threshold values', () => {
      expect(SPAM_THRESHOLDS.BLOCK_SCORE).toBe(60);
      expect(SPAM_THRESHOLDS.SILENT_SUCCESS_SCORE).toBe(80);
      expect(SPAM_THRESHOLDS.MIN_PAGE_TIME_MS).toBe(3000);
      expect(SPAM_THRESHOLDS.MIN_VALID_WORD_RATIO).toBe(0.3);
      expect(SPAM_THRESHOLDS.MAX_ENTROPY).toBe(4.7);
      expect(SPAM_THRESHOLDS.MIN_ENTROPY).toBe(2.5);
    });
  });
});
