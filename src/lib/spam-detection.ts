/**
 * Spam Detection Module
 *
 * Multi-layered spam detection for contact form submissions using:
 * - Content analysis (entropy, word validity, keyboard walks)
 * - Timing validation
 * - Honeypot checks
 * - Request fingerprinting
 *
 * Zero-cost solution with no external API calls.
 */

import type { ContactFormData } from '@/types';

/**
 * Spam score breakdown by signal type
 */
export interface SpamScoreResult {
  /** Total spam score (0-100) */
  score: number;
  /** Individual signal scores */
  breakdown: {
    /** Content analysis score (0-30 points) */
    content: number;
    /** Timing validation score (0-20 points) */
    timing: number;
    /** Honeypot check score (0 or 50 points) */
    honeypot: number;
    /** Request fingerprint score (0-15 points) */
    fingerprint: number;
  };
  /** Recommended action based on score */
  action: 'allow' | 'log' | 'block' | 'silent_success';
}

/**
 * Content analysis result
 */
export interface ContentAnalysis {
  /** Content spam score (0-30) */
  score: number;
  /** Ratio of valid words (0-1) */
  validWordRatio: number;
  /** Shannon entropy of the text */
  entropy: number;
}

/**
 * Configurable spam detection thresholds
 */
export const SPAM_THRESHOLDS = {
  /** Block submissions with score >= this value */
  BLOCK_SCORE: 60,
  /** Silent success (fake success) for score >= this value */
  SILENT_SUCCESS_SCORE: 80,
  /** Minimum time between page load and submit (ms) */
  MIN_PAGE_TIME_MS: 3000,
  /** Minimum ratio of valid words required */
  MIN_VALID_WORD_RATIO: 0.3,
  /** Maximum allowed entropy */
  MAX_ENTROPY: 4.7,
  /** Minimum allowed entropy */
  MIN_ENTROPY: 2.5,
} as const;

/**
 * Common English words + computer repair terminology
 * Optimized set of ~3000 most common words for spam detection
 */
const COMMON_WORDS = new Set([
  // Top 1000 most common English words
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having',
  'may', 'should', 'am', 'being', 'able', 'might', 'must', 'does', 'done', 'doing',
  'need', 'help', 'please', 'thanks', 'thank', 'hello', 'hi', 'yes', 'no', 'ok',
  'here', 'very', 'much', 'many', 'too', 'more', 'such', 'every', 'own', 'same',
  'call', 'phone', 'email', 'contact', 'name', 'address', 'city', 'state', 'zip',
  'home', 'business', 'service', 'customer', 'question', 'answer', 'tell', 'ask',
  'find', 'found', 'looking', 'need', 'want', 'buy', 'sell', 'price', 'cost', 'pay',
  'money', 'free', 'cheap', 'best', 'better', 'great', 'good', 'bad', 'old', 'new',
  'big', 'small', 'long', 'short', 'high', 'low', 'fast', 'slow', 'easy', 'hard',

  // Computer and technology terms
  'computer', 'laptop', 'desktop', 'tablet', 'phone', 'device', 'pc', 'mac',
  'windows', 'microsoft', 'apple', 'dell', 'hp', 'lenovo', 'asus', 'acer',
  'screen', 'display', 'monitor', 'keyboard', 'mouse', 'touchpad', 'trackpad',
  'battery', 'charger', 'power', 'adapter', 'cord', 'cable', 'usb', 'hdmi',
  'processor', 'cpu', 'intel', 'amd', 'ryzen', 'core', 'ghz', 'speed',
  'memory', 'ram', 'storage', 'disk', 'drive', 'ssd', 'hdd', 'hard',
  'graphics', 'gpu', 'video', 'card', 'nvidia', 'radeon', 'integrated',
  'motherboard', 'mainboard', 'bios', 'uefi', 'firmware', 'boot', 'startup',

  // Repair and service terms
  'repair', 'fix', 'broken', 'damage', 'damaged', 'issue', 'problem', 'error',
  'crash', 'freeze', 'freezing', 'slow', 'slowdown', 'lag', 'lagging', 'hang',
  'virus', 'malware', 'spyware', 'adware', 'trojan', 'infected', 'infection',
  'clean', 'cleanup', 'remove', 'removal', 'scan', 'scanning', 'antivirus',
  'update', 'upgrade', 'install', 'installation', 'setup', 'configure', 'setting',
  'backup', 'restore', 'recovery', 'data', 'file', 'files', 'folder', 'save',
  'delete', 'lost', 'missing', 'corrupt', 'corrupted', 'failed', 'failure',
  'diagnostic', 'diagnose', 'check', 'test', 'testing', 'troubleshoot', 'debug',
  'warranty', 'guarantee', 'refund', 'replacement', 'parts', 'component',

  // Common issues and symptoms
  'wont', 'won\'t', 'doesn\'t', 'cant', 'can\'t', 'not', 'no', 'fail', 'failed',
  'turn', 'on', 'off', 'start', 'starting', 'shutdown', 'restart', 'reboot',
  'blue', 'black', 'white', 'blank', 'flicker', 'flickering', 'dim', 'dark',
  'loud', 'noise', 'noisy', 'fan', 'fans', 'overheat', 'overheating', 'hot',
  'water', 'liquid', 'spill', 'spilled', 'drop', 'dropped', 'fall', 'fell',
  'crack', 'cracked', 'scratch', 'scratched', 'dent', 'dented', 'bend', 'bent',

  // Software and OS terms
  'software', 'program', 'application', 'app', 'apps', 'system', 'operating',
  'office', 'word', 'excel', 'powerpoint', 'outlook', 'chrome', 'firefox', 'edge',
  'internet', 'web', 'browser', 'wifi', 'wireless', 'network', 'connection',
  'driver', 'drivers', 'update', 'patch', 'version', 'license', 'key', 'activation',

  // Time and urgency
  'urgent', 'emergency', 'asap', 'soon', 'quick', 'quickly', 'fast', 'immediate',
  'today', 'tomorrow', 'week', 'weekend', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday', 'sunday', 'morning', 'afternoon', 'evening',

  // Actions and requests
  'quote', 'estimate', 'pricing', 'appointment', 'schedule', 'book', 'booking',
  'visit', 'come', 'bring', 'drop', 'pickup', 'delivery', 'ship', 'shipping',
  'information', 'info', 'details', 'explain', 'wondering', 'curious', 'interested',

  // Common filler and connective words
  'really', 'actually', 'basically', 'literally', 'probably', 'maybe', 'perhaps',
  'however', 'therefore', 'although', 'though', 'unless', 'until', 'while', 'since',
  'before', 'after', 'during', 'between', 'among', 'through', 'across', 'around',

  // Pronouns and articles
  'he', 'she', 'it', 'they', 'them', 'we', 'us', 'you', 'your', 'yours',
  'mine', 'his', 'hers', 'theirs', 'ours', 'myself', 'yourself', 'himself',
  'herself', 'itself', 'themselves', 'ourselves', 'who', 'whom', 'whose', 'which',

  // Numbers and quantities
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'first', 'second', 'third', 'last', 'next', 'few', 'several', 'couple', 'dozen',

  // Additional common computer terms
  'port', 'ports', 'connector', 'slot', 'expansion', 'pci', 'sata', 'nvme',
  'bluetooth', 'wifi', 'ethernet', 'lan', 'wan', 'router', 'modem', 'switch',
  'printer', 'scanner', 'webcam', 'camera', 'microphone', 'speaker', 'speakers',
  'sound', 'audio', 'headphone', 'headphones', 'volume', 'mute', 'unmute',

  // Build and custom terms
  'build', 'custom', 'gaming', 'office', 'workstation', 'server', 'build',
  'assemble', 'assembly', 'configure', 'configuration', 'spec', 'specs', 'specification',

  // Location terms (Kansas specific)
  'salina', 'kansas', 'ks', 'local', 'area', 'near', 'nearby', 'close', 'location',
]);

/**
 * Common keyboard walk patterns (spam bots often use these)
 */
const KEYBOARD_WALKS = [
  'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  'qazwsx', 'edcrfv', 'tgbyhn', 'ujmik', '12345', '123456', '1234567890',
  'abcdef', 'abcdefg', 'aaaa', 'bbbb', 'cccc', 'dddd', 'eeee', 'ffff',
];

/**
 * Calculate Shannon entropy of text (measure of randomness)
 *
 * English text typically has entropy between 3.5-4.5
 * Random gibberish has higher entropy (>4.7) or very low entropy (<2.5)
 *
 * @param text - Input text to analyze
 * @returns Entropy value (higher = more random)
 */
function calculateEntropy(text: string): number {
  if (text.length === 0) return 0;

  const frequency = new Map<string, number>();

  // Count character frequencies
  for (const char of text.toLowerCase()) {
    frequency.set(char, (frequency.get(char) || 0) + 1);
  }

  // Calculate Shannon entropy
  let entropy = 0;
  const textLength = text.length;

  for (const [, count] of frequency) {
    const probability = count / textLength;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Check if text contains keyboard walk patterns
 *
 * @param text - Input text to check
 * @returns true if keyboard walks detected
 */
function hasKeyboardWalks(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KEYBOARD_WALKS.some(pattern => lowerText.includes(pattern));
}

/**
 * Analyze content for spam indicators
 *
 * Checks:
 * - Shannon entropy (randomness)
 * - Valid word ratio
 * - Keyboard walk patterns
 *
 * @param message - Message content to analyze
 * @returns Content analysis with score and metrics
 */
export function analyzeContent(message: string): ContentAnalysis {
  if (!message || message.trim().length === 0) {
    return { score: 30, validWordRatio: 0, entropy: 0 };
  }

  // Calculate entropy
  const entropy = calculateEntropy(message);

  // Extract words (alphanumeric sequences)
  const words = message
    .toLowerCase()
    .match(/\b[a-z0-9]+\b/g) || [];

  if (words.length === 0) {
    return { score: 25, validWordRatio: 0, entropy };
  }

  // Calculate valid word ratio
  const validWords = words.filter(word => COMMON_WORDS.has(word));
  const validWordRatio = validWords.length / words.length;

  // Check for keyboard walks
  const hasWalks = hasKeyboardWalks(message);

  // Score calculation (0-30 points)
  let score = 0;

  // Entropy check (0-10 points)
  if (entropy > SPAM_THRESHOLDS.MAX_ENTROPY) {
    score += 10; // Very high entropy = gibberish
  } else if (entropy < SPAM_THRESHOLDS.MIN_ENTROPY) {
    score += 8; // Very low entropy = repeated chars
  } else if (entropy > 4.5) {
    score += 5; // Moderately high entropy
  }

  // Valid word ratio check (0-15 points)
  if (validWordRatio < 0.1) {
    score += 15; // Almost no valid words
  } else if (validWordRatio < SPAM_THRESHOLDS.MIN_VALID_WORD_RATIO) {
    score += 10; // Low valid word ratio
  } else if (validWordRatio < 0.5) {
    score += 5; // Moderately low valid word ratio
  }

  // Keyboard walk check (0-5 points)
  if (hasWalks) {
    score += 5;
  }

  return {
    score: Math.min(score, 30),
    validWordRatio,
    entropy,
  };
}

/**
 * Validate submission timing
 *
 * Checks if submission happened too quickly after page load
 * (likely a bot if < 3 seconds)
 *
 * @param pageLoadTime - Timestamp when page was loaded (ms)
 * @param submitTime - Timestamp when form was submitted (ms)
 * @returns Timing score (0-20 points)
 */
export function validateTiming(pageLoadTime: number, submitTime: number): number {
  if (!pageLoadTime || !submitTime || pageLoadTime <= 0 || submitTime <= 0) {
    // Missing timing data is suspicious
    return 10;
  }

  const timeDiff = submitTime - pageLoadTime;

  // Negative time difference is highly suspicious
  if (timeDiff < 0) {
    return 20;
  }

  // Too fast submission (< 3 seconds)
  if (timeDiff < SPAM_THRESHOLDS.MIN_PAGE_TIME_MS) {
    const ratio = timeDiff / SPAM_THRESHOLDS.MIN_PAGE_TIME_MS;
    return Math.round(20 * (1 - ratio));
  }

  // Reasonable timing
  return 0;
}

/**
 * Check honeypot fields
 *
 * Honeypot fields are hidden fields that humans won't fill but bots will.
 * If any honeypot field is filled, it's definitely a bot.
 *
 * @param fields - Record of field names to values
 * @returns Honeypot score (0 or 50 points)
 */
export function checkHoneypots(fields: Record<string, string | undefined>): number {
  // Common honeypot field names
  const honeypotFields = ['website', 'url', 'homepage', 'phone2', 'fax'];

  for (const field of honeypotFields) {
    const value = fields[field];
    if (value && value.trim().length > 0) {
      return 50; // Instant high score for honeypot trigger
    }
  }

  return 0;
}

/**
 * Analyze request headers for suspicious patterns
 *
 * Checks:
 * - Missing or generic User-Agent
 * - Missing Accept-Language
 * - Missing or suspicious Referer
 *
 * @param headers - Request headers
 * @returns Fingerprint score (0-15 points)
 */
function analyzeFingerprint(headers: Headers): number {
  let score = 0;

  // Check User-Agent
  const userAgent = headers.get('user-agent') || '';
  if (!userAgent) {
    score += 5;
  } else if (
    userAgent.toLowerCase().includes('bot') ||
    userAgent.toLowerCase().includes('curl') ||
    userAgent.toLowerCase().includes('wget') ||
    userAgent.toLowerCase().includes('python') ||
    userAgent === 'Mozilla/5.0'
  ) {
    score += 5;
  }

  // Check Accept-Language
  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) {
    score += 5;
  }

  // Check Referer
  const referer = headers.get('referer') || '';
  if (!referer) {
    score += 3;
  } else {
    // Check if referer is from external domain
    const url = new URL(referer).hostname;
    const origin = headers.get('origin') || headers.get('host') || '';
    if (origin && !url.includes(origin) && !origin.includes(url)) {
      score += 2;
    }
  }

  return Math.min(score, 15);
}

/**
 * Calculate spam score for a contact form submission
 *
 * Multi-layered analysis:
 * - Content (30 points max)
 * - Timing (20 points max)
 * - Honeypot (50 points max)
 * - Fingerprint (15 points max)
 *
 * Actions:
 * - 0-39: allow (legitimate)
 * - 40-59: log (suspicious, but allow)
 * - 60-79: block (likely spam)
 * - 80+: silent_success (definite spam, fake success response)
 *
 * @param data - Contact form data
 * @param headers - Request headers
 * @returns Spam score result with breakdown and recommended action
 */
export function calculateSpamScore(
  data: ContactFormData & { website?: string; pageLoadTime?: number; submitTime?: number },
  headers: Headers
): SpamScoreResult {
  // Content analysis
  const contentAnalysis = analyzeContent(data.message);
  const contentScore = contentAnalysis.score;

  // Timing validation
  const timingScore = validateTiming(
    data.pageLoadTime || 0,
    data.submitTime || Date.now()
  );

  // Honeypot check
  const honeypotScore = checkHoneypots({
    website: data.website,
    // Add more honeypot fields here if needed
  });

  // Request fingerprint
  const fingerprintScore = analyzeFingerprint(headers);

  // Calculate total score
  const totalScore = contentScore + timingScore + honeypotScore + fingerprintScore;

  // Determine action
  let action: SpamScoreResult['action'];
  if (totalScore >= SPAM_THRESHOLDS.SILENT_SUCCESS_SCORE) {
    action = 'silent_success';
  } else if (totalScore >= SPAM_THRESHOLDS.BLOCK_SCORE) {
    action = 'block';
  } else if (totalScore >= 40) {
    action = 'log';
  } else {
    action = 'allow';
  }

  return {
    score: Math.min(totalScore, 100),
    breakdown: {
      content: contentScore,
      timing: timingScore,
      honeypot: honeypotScore,
      fingerprint: fingerprintScore,
    },
    action,
  };
}
