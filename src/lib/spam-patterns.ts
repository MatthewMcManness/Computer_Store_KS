/**
 * Spam Pattern Detection Module
 *
 * Detects common spam patterns in form submissions:
 * - Spam keywords (viagra, bitcoin, SEO services, etc.)
 * - Excessive URLs
 * - Excessive caps
 * - Repeated characters
 * - Foreign scripts (when form is English)
 * - Contact info in message body
 */

/**
 * Common spam keywords and phrases
 */
const SPAM_KEYWORDS = [
  // Pharmaceutical spam
  'viagra', 'cialis', 'pharmacy', 'pills', 'medication', 'prescription',
  'drug', 'pharma', 'meds online', 'cheap meds',

  // Crypto/finance spam
  'bitcoin', 'crypto', 'cryptocurrency', 'forex', 'trading', 'investment opportunity',
  'make money fast', 'get rich', 'passive income', 'financial freedom',
  'binary options', 'earn money online', 'work from home opportunity',

  // SEO/marketing spam
  'seo services', 'seo expert', 'website traffic', 'backlinks', 'link building',
  'google ranking', 'first page google', 'social media marketing',
  'digital marketing', 'web design services', 'affordable web',
  'increase your traffic', 'boost your ranking', 'marketing agency',

  // Generic spam phrases
  'click here', 'act now', 'limited time', 'buy now', 'order now',
  'free money', 'congratulations', 'you won', 'winner', 'prize',
  'no obligation', 'risk free', 'guarantee', 'special offer',
  'exclusive deal', 'discount', 'cheap', 'best price',

  // Adult content
  'adult', 'xxx', 'dating', 'singles', 'hookup', 'meet women', 'meet men',

  // Scam indicators
  'nigerian prince', 'inheritance', 'lottery', 'unclaimed funds',
  'bank transfer', 'wire transfer', 'western union', 'moneygram',

  // Common spam sender patterns
  'dear sir', 'dear madam', 'dear friend', 'to whom it may concern',
  'i am writing to', 'i came across your', 'i found your website',
  'i noticed your website', 'i saw your site',

  // Lead generation spam
  'qualified leads', 'email list', 'mailing list', 'database',
  'b2b leads', 'targeted traffic',
];

/**
 * Result of spam pattern analysis
 */
export interface SpamPatternResult {
  /** Total score from pattern detection (0-30) */
  score: number;
  /** Detected patterns */
  patterns: string[];
  /** Detailed breakdown */
  details: {
    spamKeywords: string[];
    urlCount: number;
    capsRatio: number;
    hasRepeatedChars: boolean;
    hasForeignScript: boolean;
    hasContactInMessage: boolean;
  };
}

/**
 * Detect spam patterns in message content
 *
 * @param message - Message content to analyze
 * @param email - Email in form (to check for different email in message)
 * @returns Spam pattern analysis result
 */
export function detectSpamPatterns(message: string, email?: string): SpamPatternResult {
  const patterns: string[] = [];
  let score = 0;

  const lowerMessage = message.toLowerCase();

  // 1. Check for spam keywords (max 15 points)
  const foundKeywords = SPAM_KEYWORDS.filter(keyword =>
    lowerMessage.includes(keyword.toLowerCase())
  );
  if (foundKeywords.length > 0) {
    score += Math.min(foundKeywords.length * 5, 15);
    patterns.push('spam_keywords');
  }

  // 2. Count URLs (max 10 points)
  const urlMatches = message.match(/https?:\/\/[^\s]+/gi) || [];
  const urlCount = urlMatches.length;
  if (urlCount > 2) {
    score += Math.min((urlCount - 2) * 5, 10);
    patterns.push('excessive_urls');
  }

  // 3. Check for excessive caps (max 10 points)
  const letters = message.match(/[a-zA-Z]/g) || [];
  const upperCase = message.match(/[A-Z]/g) || [];
  const capsRatio = letters.length > 0 ? upperCase.length / letters.length : 0;
  if (capsRatio > 0.5 && letters.length > 20) {
    score += 10;
    patterns.push('excessive_caps');
  } else if (capsRatio > 0.3 && letters.length > 20) {
    score += 5;
    patterns.push('high_caps');
  }

  // 4. Check for repeated characters (max 5 points)
  const hasRepeatedChars = /(.)\1{4,}/.test(message);
  if (hasRepeatedChars) {
    score += 5;
    patterns.push('repeated_chars');
  }

  // 5. Check for foreign scripts (max 10 points)
  // Cyrillic, Arabic, Chinese - suspicious for English form
  const hasCyrillic = /[\u0400-\u04FF]/.test(message);
  const hasArabic = /[\u0600-\u06FF]/.test(message);
  const hasChinese = /[\u4E00-\u9FFF]/.test(message);
  const hasForeignScript = hasCyrillic || hasArabic || hasChinese;
  if (hasForeignScript) {
    score += 10;
    patterns.push('foreign_script');
  }

  // 6. Check for contact info in message (possible phishing)
  const emailInMessage = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(message);
  const phoneInMessage = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(message);
  const hasContactInMessage = emailInMessage || phoneInMessage;

  // Only flag if email in message is different from form email
  if (emailInMessage && email) {
    const messageEmails = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const differentEmail = messageEmails.some(e => e.toLowerCase() !== email.toLowerCase());
    if (differentEmail) {
      score += 5;
      patterns.push('different_email_in_message');
    }
  }

  return {
    score: Math.min(score, 30), // Cap at 30 points
    patterns,
    details: {
      spamKeywords: foundKeywords,
      urlCount,
      capsRatio,
      hasRepeatedChars,
      hasForeignScript,
      hasContactInMessage,
    },
  };
}

/**
 * Quick check if message contains any spam keywords
 *
 * @param message - Message to check
 * @returns true if spam keywords detected
 */
export function hasSpamKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
}
