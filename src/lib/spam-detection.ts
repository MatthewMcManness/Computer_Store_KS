/**
 * Spam Detection Module
 *
 * Multi-layered spam detection for contact form submissions using:
 * - Content analysis (entropy, word validity, keyboard walks)
 * - Spam pattern detection (keywords, links, caps)
 * - Timing validation
 * - Honeypot checks
 * - Request fingerprinting
 * - Disposable email detection
 * - Behavioral analysis (interaction tracking)
 * - Browser fingerprinting
 * - Turnstile verification
 *
 * Zero-cost solution with optional Cloudflare Turnstile integration.
 */

import type { ContactFormData } from '@/types';
import { detectSpamPatterns } from './spam-patterns';
import { getDisposableEmailScore } from './disposable-email';

/**
 * Extended spam score breakdown with new detection layers
 */
export interface SpamScoreResult {
  /** Total spam score (0-200+) */
  score: number;
  /** Individual signal scores */
  breakdown: {
    /** Content analysis score (0-35 points) */
    content: number;
    /** Spam patterns score (0-30 points) */
    patterns: number;
    /** Timing validation score (0-20 points) */
    timing: number;
    /** Honeypot check score (0 or 50 points) */
    honeypot: number;
    /** Request fingerprint score (0-15 points) */
    fingerprint: number;
    /** Disposable email score (0 or 25 points) */
    disposableEmail: number;
    /** Interaction tracking score (0-20 points) */
    interaction: number;
    /** Browser fingerprint score (0-10 points) */
    browserFingerprint: number;
    /** Turnstile verification score (0 or 30 points) */
    turnstile: number;
    /** Gibberish detection score (0-30 points) */
    gibberish: number;
    /** Name validation score (0-25 points) */
    nameValidation: number;
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
 * Updated for new multi-layer detection
 */
export const SPAM_THRESHOLDS = {
  /** Block submissions with score >= this value */
  BLOCK_SCORE: 80,
  /** Silent success (fake success) for score >= this value */
  SILENT_SUCCESS_SCORE: 120,
  /** Log suspicious submissions with score >= this value */
  LOG_SCORE: 50,
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
  'topeka',
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
 * Common English vowel patterns for gibberish detection
 */
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Detect if a string is likely gibberish (random characters)
 * Uses multiple heuristics:
 * - Consonant cluster analysis
 * - Character transition patterns
 * - Mixed case in single "words"
 */
export function isGibberish(text: string): { isGibberish: boolean; score: number; reasons: string[] } {
  if (!text || text.trim().length === 0) {
    return { isGibberish: false, score: 0, reasons: [] };
  }

  const reasons: string[] = [];
  let score = 0;

  // Clean text for analysis
  const cleanText = text.trim().toLowerCase();
  const words = cleanText.match(/[a-z]+/gi) || [];

  if (words.length === 0) {
    return { isGibberish: false, score: 0, reasons: [] };
  }

  // Check each word for gibberish patterns
  for (const word of words) {
    if (word.length < 3) continue;

    const lowerWord = word.toLowerCase();

    // 1. Check for excessive consecutive consonants (more than 4)
    const consonantClusters = lowerWord.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi);
    if (consonantClusters) {
      score += 10;
      reasons.push(`long_consonant_cluster:${consonantClusters[0]}`);
    }

    // 2. Check vowel ratio (real words have 20-60% vowels typically)
    const vowelCount = [...lowerWord].filter(c => VOWELS.has(c)).length;
    const vowelRatio = vowelCount / lowerWord.length;
    if (vowelRatio < 0.1 && lowerWord.length > 4) {
      score += 8;
      reasons.push('very_low_vowels');
    } else if (vowelRatio > 0.7 && lowerWord.length > 4) {
      score += 5;
      reasons.push('excessive_vowels');
    }

    // 3. Check for random case mixing within a single word (e.g., "CiNYZSmxHz")
    const hasRandomCase = /[a-z][A-Z][a-z]|[A-Z][a-z][A-Z]/.test(word);
    if (hasRandomCase && word.length > 5) {
      score += 15;
      reasons.push('random_case_mixing');
    }

    // 4. Check for unlikely character transitions
    // Real words don't often have sequences like "xz", "qj", "zx", "wq"
    const unlikelyPairs = ['xz', 'zx', 'qj', 'jq', 'wq', 'qw', 'vx', 'xv', 'zj', 'jz', 'qx', 'xq'];
    for (const pair of unlikelyPairs) {
      if (lowerWord.includes(pair)) {
        score += 5;
        reasons.push(`unlikely_pair:${pair}`);
        break;
      }
    }
  }

  // 5. Check overall text for base64-like patterns (common in spam bot output)
  // Base64 often has mixed case and specific character patterns
  const base64Pattern = /^[A-Za-z0-9+/=]{10,}$/;
  if (base64Pattern.test(text.replace(/\s/g, ''))) {
    score += 20;
    reasons.push('base64_like');
  }

  // 6. Check for lack of spaces in long text (single long gibberish word)
  if (text.length > 12 && !text.includes(' ')) {
    score += 10;
    reasons.push('no_spaces_long_text');
  }

  return {
    isGibberish: score >= 15,
    score: Math.min(score, 30),
    reasons,
  };
}

/**
 * Validate that a name looks like a real human name
 * Returns spam score (0 = looks valid, higher = suspicious)
 */
export function validateName(name: string): { score: number; reasons: string[] } {
  if (!name || name.trim().length === 0) {
    return { score: 0, reasons: [] };
  }

  const reasons: string[] = [];
  let score = 0;

  const cleanName = name.trim();

  // 1. Check for gibberish in name
  const gibberishResult = isGibberish(cleanName);
  if (gibberishResult.isGibberish) {
    score += gibberishResult.score;
    reasons.push(...gibberishResult.reasons.map(r => `name_${r}`));
  }

  // 2. Names shouldn't be all uppercase (except very short like "JR")
  if (cleanName.length > 3 && cleanName === cleanName.toUpperCase()) {
    score += 5;
    reasons.push('name_all_caps');
  }

  // 3. Names typically don't have numbers
  if (/\d/.test(cleanName)) {
    score += 10;
    reasons.push('name_has_numbers');
  }

  // 4. Names typically have at least one space (first and last name)
  // Single-word names are suspicious for formal contact forms
  if (!cleanName.includes(' ') && cleanName.length > 2) {
    score += 3;
    reasons.push('name_single_word');
  }

  // 5. Check for very long names without spaces (likely gibberish)
  if (cleanName.length > 20 && !cleanName.includes(' ')) {
    score += 15;
    reasons.push('name_too_long_no_spaces');
  }

  return { score: Math.min(score, 25), reasons };
}

/**
 * Calculate Shannon entropy of text (measure of randomness)
 */
function calculateEntropy(text: string): number {
  if (text.length === 0) return 0;

  const frequency = new Map<string, number>();

  for (const char of text.toLowerCase()) {
    frequency.set(char, (frequency.get(char) || 0) + 1);
  }

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
 */
function hasKeyboardWalks(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KEYBOARD_WALKS.some(pattern => lowerText.includes(pattern));
}

/**
 * Analyze content for spam indicators
 */
export function analyzeContent(message: string): ContentAnalysis {
  if (!message || message.trim().length === 0) {
    return { score: 30, validWordRatio: 0, entropy: 0 };
  }

  const entropy = calculateEntropy(message);

  const words = message
    .toLowerCase()
    .match(/\b[a-z0-9]+\b/g) || [];

  if (words.length === 0) {
    return { score: 25, validWordRatio: 0, entropy };
  }

  const validWords = words.filter(word => COMMON_WORDS.has(word));
  const validWordRatio = validWords.length / words.length;

  const hasWalks = hasKeyboardWalks(message);

  let score = 0;

  // Entropy check (0-10 points)
  if (entropy > SPAM_THRESHOLDS.MAX_ENTROPY) {
    score += 10;
  } else if (entropy < SPAM_THRESHOLDS.MIN_ENTROPY) {
    score += 8;
  } else if (entropy > 4.5) {
    score += 5;
  }

  // Valid word ratio check (0-20 points)
  // Messages should contain recognizable English words
  if (validWordRatio === 0 && words.length > 0) {
    // Zero valid words is highly suspicious
    score += 20;
  } else if (validWordRatio < 0.1) {
    score += 15;
  } else if (validWordRatio < SPAM_THRESHOLDS.MIN_VALID_WORD_RATIO) {
    score += 10;
  } else if (validWordRatio < 0.5) {
    score += 5;
  }

  // Keyboard walk check (0-5 points)
  if (hasWalks) {
    score += 5;
  }

  return {
    score: Math.min(score, 35),
    validWordRatio,
    entropy,
  };
}

/**
 * Validate submission timing
 */
export function validateTiming(pageLoadTime: number, submitTime: number): number {
  if (!pageLoadTime || !submitTime || pageLoadTime <= 0 || submitTime <= 0) {
    return 10;
  }

  const timeDiff = submitTime - pageLoadTime;

  if (timeDiff < 0) {
    return 20;
  }

  if (timeDiff < SPAM_THRESHOLDS.MIN_PAGE_TIME_MS) {
    const ratio = timeDiff / SPAM_THRESHOLDS.MIN_PAGE_TIME_MS;
    return Math.round(20 * (1 - ratio));
  }

  return 0;
}

/**
 * Check honeypot fields
 */
export function checkHoneypots(fields: Record<string, string | undefined>): number {
  const honeypotFields = [
    'website',
    'url',
    'homepage',
    'phone2',
    'fax',
    '_hp_email2',
    '_hp_phone_confirm',
    '_hp_url',
  ];

  for (const field of honeypotFields) {
    const value = fields[field];
    if (value && value.trim().length > 0) {
      return 50;
    }
  }

  return 0;
}

/**
 * Analyze request headers for suspicious patterns
 */
function analyzeFingerprint(headers: Headers): number {
  let score = 0;

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

  const acceptLanguage = headers.get('accept-language');
  if (!acceptLanguage) {
    score += 5;
  }

  const referer = headers.get('referer') || '';
  if (!referer) {
    score += 3;
  } else {
    try {
      const url = new URL(referer).hostname;
      const origin = headers.get('origin') || headers.get('host') || '';
      if (origin && !url.includes(origin) && !origin.includes(url)) {
        score += 2;
      }
    } catch {
      score += 2;
    }
  }

  return Math.min(score, 15);
}

/**
 * Extended form data with all bot protection fields
 */
export interface ExtendedFormData extends ContactFormData {
  website?: string;
  pageLoadTime?: number;
  submitTime?: number;
  _hp_email2?: string;
  _hp_phone_confirm?: string;
  _hp_url?: string;
  _turnstile?: string;
  _interaction?: {
    score: number;
    maxScore: number;
    isHumanLike: boolean;
    spamScore: number;
  };
  _fingerprint?: {
    visitorId: string;
    confidence: number;
    simpleFingerprint: string;
    spamScore: number;
  };
}

/**
 * Verify Cloudflare Turnstile token
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key configured, skip verification (allows testing)
  if (!secretKey) {
    console.log('Turnstile: No secret key configured, skipping verification');
    return true;
  }

  // If no token provided, fail verification
  if (!token) {
    console.log('Turnstile: No token provided');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      console.warn('Turnstile verification failed:', JSON.stringify({
        success: data.success,
        errorCodes: data['error-codes'],
        hostname: data.hostname,
        ip,
      }));
    }
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false; // Fail closed on error
  }
}

/**
 * Calculate comprehensive spam score for a contact form submission
 *
 * Multi-layered analysis:
 * - Content (30 points max) - entropy, word validity, keyboard walks
 * - Patterns (30 points max) - spam keywords, links, caps
 * - Timing (20 points max) - submission speed
 * - Honeypot (50 points) - hidden field detection
 * - Fingerprint (15 points max) - request headers
 * - Disposable Email (25 points) - throwaway email detection
 * - Interaction (20 points max) - behavioral analysis
 * - Browser Fingerprint (10 points max) - client fingerprint
 * - Turnstile (30 points) - CAPTCHA verification
 * - Gibberish (30 points max) - random character detection in message
 * - Name Validation (25 points max) - suspicious name patterns
 *
 * Actions based on thresholds:
 * - 0-49: allow (legitimate)
 * - 50-79: log (suspicious, but allow)
 * - 80-119: block (likely spam)
 * - 120+: silent_success (definite spam, fake success response)
 */
export async function calculateSpamScore(
  data: ExtendedFormData,
  headers: Headers,
  clientIP: string
): Promise<SpamScoreResult> {
  // Content analysis (0-35)
  const contentAnalysis = analyzeContent(data.message);
  const contentScore = contentAnalysis.score;

  // Spam pattern detection (0-30)
  const patternResult = detectSpamPatterns(data.message, data.email);
  const patternsScore = patternResult.score;

  // Timing validation (0-20)
  const timingScore = validateTiming(
    data.pageLoadTime || 0,
    data.submitTime || Date.now()
  );

  // Honeypot check (0 or 50)
  const honeypotScore = checkHoneypots({
    website: data.website,
    _hp_email2: data._hp_email2,
    _hp_phone_confirm: data._hp_phone_confirm,
    _hp_url: data._hp_url,
  });

  // Request fingerprint (0-15)
  const fingerprintScore = analyzeFingerprint(headers);

  // Disposable email detection (0 or 25)
  const disposableEmailScore = getDisposableEmailScore(data.email);

  // Interaction tracking (0-20)
  const interactionScore = data._interaction?.spamScore || 0;

  // Browser fingerprint (0-10)
  const browserFingerprintScore = data._fingerprint?.spamScore || 0;

  // Turnstile verification (0 or 30)
  let turnstileScore = 0;
  let turnstileFailed = false;
  if (data._turnstile) {
    const turnstileValid = await verifyTurnstile(data._turnstile, clientIP);
    if (!turnstileValid) {
      // Turnstile failure is one signal among many, not an instant kill.
      // Legitimate users can fail Turnstile due to misconfigured keys,
      // network issues, or Cloudflare outages.
      turnstileScore = 30;
      turnstileFailed = true;
    }
  } else if (process.env.TURNSTILE_SECRET_KEY) {
    // Token required but not provided — suspicious but not fatal
    turnstileScore = 30;
    turnstileFailed = true;
  }

  // Gibberish detection in message (0-30, or 200 for instant block)
  const messageGibberishResult = isGibberish(data.message);
  let gibberishScore = messageGibberishResult.score;

  // If message has zero valid words AND is detected as gibberish, instant block
  // No legitimate customer sends pure gibberish as a message
  if (contentAnalysis.validWordRatio === 0 && messageGibberishResult.isGibberish) {
    gibberishScore = 200;
  }

  // Name validation (0-25)
  const nameResult = validateName(data.name);
  const nameValidationScore = nameResult.score;

  // Calculate total score
  const totalScore =
    contentScore +
    patternsScore +
    timingScore +
    honeypotScore +
    fingerprintScore +
    disposableEmailScore +
    interactionScore +
    browserFingerprintScore +
    turnstileScore +
    gibberishScore +
    nameValidationScore;

  // Determine action based on thresholds
  let action: SpamScoreResult['action'];
  if (totalScore >= SPAM_THRESHOLDS.SILENT_SUCCESS_SCORE) {
    action = 'silent_success';
  } else if (totalScore >= SPAM_THRESHOLDS.BLOCK_SCORE) {
    action = 'block';
  } else if (totalScore >= SPAM_THRESHOLDS.LOG_SCORE) {
    action = 'log';
  } else {
    action = 'allow';
  }

  return {
    score: totalScore,
    breakdown: {
      content: contentScore,
      patterns: patternsScore,
      timing: timingScore,
      honeypot: honeypotScore,
      fingerprint: fingerprintScore,
      disposableEmail: disposableEmailScore,
      interaction: interactionScore,
      browserFingerprint: browserFingerprintScore,
      turnstile: turnstileScore,
      gibberish: gibberishScore,
      nameValidation: nameValidationScore,
    },
    action,
  };
}

