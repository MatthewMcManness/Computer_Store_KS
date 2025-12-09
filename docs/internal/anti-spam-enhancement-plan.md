# Anti-Spam Enhancement Plan for Computer Store Kansas

**Created:** December 9, 2025
**Branch:** Computer-Store-KS
**Status:** Planning

---

## Current State Analysis

### What's Already Implemented

**File: `src/lib/spam-detection.ts`**

| Layer | Technique | Max Score | How It Works |
|-------|-----------|-----------|--------------|
| Content | Shannon entropy | 10 pts | Detects gibberish (high randomness) or repeated chars (low randomness) |
| Content | Valid word ratio | 15 pts | Checks against ~3000 word dictionary (English + tech terms) |
| Content | Keyboard walks | 5 pts | Detects patterns like "qwerty", "asdfgh", "12345" |
| Timing | Page load → submit | 20 pts | Penalizes submissions < 3 seconds after page load |
| Honeypot | 4 hidden fields | 50 pts | `website`, `_hp_email2`, `_hp_phone_confirm`, `_hp_url` |
| Fingerprint | User-Agent check | 5 pts | Flags bot/curl/wget/python agents |
| Fingerprint | Accept-Language | 5 pts | Missing = suspicious |
| Fingerprint | Referer validation | 5 pts | Missing or external = suspicious |

**File: `src/app/api/contact/route.ts`**
- Rate limiting: **10 requests/minute/IP** (in-memory store)
- Zod validation schema
- Basic XSS sanitization (removes `<` and `>`)
- CORS headers for cross-origin requests

**Current Thresholds:**
- Score 0-39: Allow
- Score 40-59: Log (suspicious but allow)
- Score 60-79: Block (return error)
- Score 80+: Silent success (fake success to confuse bots)

### Why Spam Still Gets Through

1. **No CAPTCHA/challenge** - Sophisticated bots bypass all passive detection
2. **Content analysis gaps** - No spam keyword detection, no link counting, no caps detection
3. **No disposable email detection** - Spammers use throwaway emails (tempmail.com, etc.)
4. **No browser fingerprinting** - Headless browsers appear legitimate
5. **No behavioral tracking** - Bots can mimic timing but not mouse/keyboard patterns
6. **IP-only rate limiting** - Same spammer, different IPs bypasses limits
7. **Timing is simplistic** - Only checks "too fast", not interaction patterns or variance

---

## Recommended Enhancements

### Phase 1: Zero-Cost Quick Wins (Implement First)

#### 1.1 Enhanced Content Analysis
**File to modify:** `src/lib/spam-detection.ts`

Add detection for:
- **Excessive URLs** - >2 links = +10 pts per extra link
- **Spam keywords** - "viagra", "bitcoin", "click here", "free money", "SEO services", "web design", etc. = +5 pts each
- **Excessive caps** - >50% uppercase = +15 pts
- **Repeated characters** - "aaaaa", "!!!!!" = +10 pts
- **Foreign scripts** - Cyrillic, Arabic, Chinese (when form is English) = +10 pts
- **Contact info in message** - Email/phone in body (phishing) = +5 pts

**Expected Impact:** +10-15% spam blocked

#### 1.2 Disposable Email Detection
**New file:** `src/lib/disposable-email.ts`

Block/flag emails from 3000+ known disposable domains:
- tempmail.com, 10minutemail.com, guerrillamail.com, mailinator.com
- Use open-source list from GitHub

**Expected Impact:** +5-10% spam blocked

#### 1.3 Sophisticated Timing Analysis
**File to modify:** `src/lib/spam-detection.ts`

Add detection for:
- **Perfect timing** - Exactly X.000 seconds = automated (+5 pts)
- **Linear field progression** - Bot fills fields in perfect order (+10 pts)
- **No keystroke variance** - All keystrokes exactly same interval (+10 pts)
- **Too slow** - >30 minutes = bot returned to tab (+10 pts)

**Expected Impact:** +5% spam blocked

#### 1.4 DNS Blocklist Checking
**New file:** `src/lib/dns-blocklist.ts`

Check IPs against free blocklists (no API key needed):
- zen.spamhaus.org
- bl.spamcop.net
- dnsbl.sorbs.net

**Expected Impact:** +5-10% spam blocked

---

### Phase 2: High-Impact Additions (Highest Priority)

#### 2.1 Cloudflare Turnstile (FREE Invisible CAPTCHA)
**Impact:** 95-99% bot detection
**UX Impact:** None (completely invisible)
**Cost:** Free forever

This is the **single most effective addition**. Turnstile runs invisible JavaScript challenges in the background without any user interaction.

**Integration:**
- Frontend: Add `@marsidev/react-turnstile` to contact form
- Backend: Verify token with Cloudflare API before processing
- Fallback: If Turnstile fails, still process with spam score

**Setup:**
1. Create free Cloudflare account
2. Add site to Turnstile dashboard
3. Get site key and secret key
4. Add to environment variables

#### 2.2 Browser Fingerprinting (FingerprintJS Open Source)
**Impact:** 85-90% bot detection
**UX Impact:** None
**Cost:** Free (open-source version)

Captures 30+ signals:
- Canvas fingerprint
- WebGL fingerprint
- Audio context
- Installed fonts
- Hardware concurrency
- Device memory
- Platform

Use fingerprint for:
- Rate limiting by fingerprint (same device, different IPs)
- Bot detection (headless browsers have distinct fingerprints)

#### 2.3 Interaction Tracking
**Impact:** 70-80% bot detection
**UX Impact:** None

Track client-side:
- Mouse movements (humans have 5+ movements)
- Clicks (humans click at least once)
- Keystrokes (humans type)
- Scrolls (humans scroll)
- Focus events (humans tab between fields)

Bots typically have:
- Zero mouse movements
- Perfect keystroke timing
- No hesitations or corrections

---

### Phase 3: Advanced Protection (Future)

#### 3.1 Multi-Dimensional Rate Limiting
Rate limit by multiple factors:
- Per IP: 5/minute
- Per email: 3/hour (prevent same email spam)
- Per fingerprint: 10/day
- Per IP+email combo: 2/minute

Requires Redis for distributed state (Upstash free tier: 10K requests/day)

#### 3.2 IP Reputation API (Optional)
Use IPQualityScore free tier (5,000 requests/month):
- Proxy/VPN detection
- Fraud score
- Recent abuse history

#### 3.3 Proof of Work Challenge
For high-risk submissions only:
- Run SHA-256 puzzle in Web Worker
- Takes 30-60 seconds per submission
- Zero impact on normal users
- Makes mass-spamming computationally expensive

---

## Implementation Priority

```
PHASE 1: Zero-Cost Quick Wins
├── 1.1 Enhanced content analysis (spam keywords, links, caps)
├── 1.2 Disposable email detection
├── 1.3 Sophisticated timing analysis
└── 1.4 DNS blocklist checking

PHASE 2: High-Impact (RECOMMENDED FIRST)
├── 2.1 Cloudflare Turnstile ← HIGHEST PRIORITY SINGLE ITEM
├── 2.2 Browser fingerprinting (FingerprintJS)
└── 2.3 Interaction tracking (mouse/keyboard)

PHASE 3: Advanced (Future)
├── 3.1 Multi-dimensional rate limiting (Redis)
├── 3.2 IP reputation API
└── 3.3 Proof of work challenges
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/lib/disposable-email.ts` | Disposable email detection |
| `src/data/disposable-domains.json` | 3000+ disposable domains list |
| `src/lib/dns-blocklist.ts` | DNS blocklist checking |
| `src/lib/spam-patterns.ts` | Spam keyword/pattern detection |
| `src/hooks/useInteractionTracking.ts` | Mouse/keyboard tracking |
| `src/hooks/useFingerprint.ts` | Browser fingerprinting |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/spam-detection.ts` | Add new scoring functions, adjust thresholds |
| `src/components/forms/contact-form.tsx` | Add Turnstile, fingerprint, interaction hooks |
| `src/app/api/contact/route.ts` | Verify Turnstile, check disposable emails, DNS blocklist |
| `src/hooks/useBotProtection.ts` | Enhance timing capture with field interactions |
| `.env.local` | Add Turnstile keys |

### Dependencies to Add
```bash
bun add @marsidev/react-turnstile @fingerprintjs/fingerprintjs
```

---

## Updated Scoring System

### New Maximum Scores (After All Phases)

| Category | Current Max | Proposed Max |
|----------|-------------|--------------|
| Content Analysis | 30 | 45 |
| Spam Patterns (new) | 0 | 30 |
| Timing Analysis | 20 | 30 |
| Honeypot | 50 | 50 |
| Fingerprinting | 15 | 25 |
| Behavioral (new) | 0 | 20 |
| Disposable Email (new) | 0 | 25 |
| DNS Blocklist (new) | 0 | 30 |
| **Total Possible** | **115** | **255** |

### New Thresholds (After Enhancements)

| Score | Action |
|-------|--------|
| 0-49 | Allow |
| 50-79 | Log + Allow |
| 80-119 | Block |
| 120+ | Silent Success |

---

## Environment Variables Needed

```env
# Cloudflare Turnstile (Phase 2)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Optional: IP Reputation (Phase 3)
IPQS_API_KEY=your_api_key

# Optional: Redis Rate Limiting (Phase 3)
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

---

## Expected Results

| Phase | Spam Blocked | False Positives | UX Impact |
|-------|--------------|-----------------|-----------|
| Current | ~80-85% | <1% | None |
| + Phase 1 | ~90-93% | <1% | None |
| + Phase 2 | ~96-98% | <0.5% | None |
| + Phase 3 | ~99%+ | <0.1% | Minimal |

---

## Risk Mitigation

### False Positive Prevention
1. **Turnstile fallback** - If Turnstile fails/times out, still process with spam score
2. **Low-friction appeals** - Error message includes phone number for legitimate users
3. **Logging** - All blocked submissions logged for review
4. **Gradual rollout** - Start with logging-only mode before blocking

### Performance Considerations
1. **DNS blocklist** - Cache results for 1 hour (same IP = same result)
2. **Fingerprinting** - Runs client-side, no server impact
3. **Turnstile** - Async verification, adds ~100ms latency
4. **Content analysis** - O(n) word matching, negligible impact

---

## Testing Strategy

### Before Implementation
1. Export spam logs from server (check Render logs)
2. Identify common patterns in spam messages
3. Note any legitimate submissions that were blocked (false positives)

### After Each Phase
1. Run test submissions:
   - Legitimate: Various subjects, messages, timing
   - Spam-like: Fast submissions, gibberish, honeypot fills
2. Monitor logs for:
   - Score distribution changes
   - False positive rate
   - Spam that still gets through

### Ongoing Monitoring
- Review `spam_score` logs weekly in Render dashboard
- Adjust thresholds based on actual data
- Add new spam patterns to detection as they emerge

---

## Summary

The recommended approach is **defense in depth** - multiple independent layers that each catch different types of spam:

1. **Passive detection** (content, timing, honeypots) catches dumb bots
2. **Active challenges** (Turnstile) catches sophisticated bots
3. **Behavioral analysis** (fingerprint, interaction) catches headless browsers
4. **Reputation systems** (DNS blocklist, disposable email) catches known bad actors

No single technique blocks all spam, but combined they achieve 96-99% effectiveness while maintaining zero friction for legitimate users.

---

## Recommended First Action

**Implement Cloudflare Turnstile** - it's free, invisible, and blocks 95%+ of bots on its own. This single change will likely eliminate most of your spam problem immediately.

Steps:
1. Sign up at https://dash.cloudflare.com/
2. Go to Turnstile → Add Widget
3. Choose "Invisible" mode
4. Get site key and secret key
5. Add to environment variables
6. Integrate into contact form
