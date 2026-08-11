/**
 * SHOP FACTS - Small shared lists of real store facts that more than one
 * page renders, so the two places can never word them differently.
 *
 * Everything here comes from docs/profile; nothing is invented. The
 * certifications are the owner's personal certifications.
 *
 * WHEN TO EDIT: When Max gains or drops a certification. Address, phone,
 * hours, and founding facts live in src/lib/constants.ts, not here.
 */

/**
 * Max's certifications, worded once for both the homepage strip and
 * /about.
 *
 * LOCKED WORDING. The shape brief fixes this list as "A+, Security+,
 * Network+, ESET with no embellishment", and the source it comes from
 * (docs/notes/2026-07-08_redesign-onboarding-brief.md) lists the same
 * four bare names. The fourth item shipped as "ESET Certified", which
 * embellished the anchor and made one of the four read differently from
 * the other three. The heading above the list carries the certification
 * framing for all four.
 */
export const CERTIFICATIONS = ['A+', 'Security+', 'Network+', 'ESET'] as const;
