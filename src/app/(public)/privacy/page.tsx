/**
 * PRIVACY POLICY PAGE - Plain-spoken statement of what the site
 * collects and what happens to it. Everything here describes what the
 * site actually does (contact form relay, Google Analytics, embedded
 * Google Maps and the external shop catalog); nothing is boilerplate
 * for features the site does not have.
 *
 * WHEN TO EDIT: When the site starts or stops collecting something, or
 * when Max revises the wording. Contact facts live in constants.ts.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PhoneLink } from '@/components/ui/phone-link';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

/** One description string for the meta tag and the share card. */
const PAGE_DESCRIPTION = `How ${BUSINESS_INFO.name} handles information from this website: the contact form, basic visit analytics, and embedded services. No accounts, no selling data.`;

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: PAGE_DESCRIPTION,
  path: '/privacy',
  shareTitle: 'Privacy policy',
});

/** The policy content: heading plus plain paragraphs, no legal boilerplate. */
const POLICY_SECTIONS = [
  {
    heading: 'What we collect',
    paragraphs: [
      'This site has no customer accounts and no login. The only information you can give us here is what you type into the contact form: your name, email address, phone number, and message.',
      'The form sends that information to the shop by email so we can answer you. We use it to respond and for nothing else. We do not sell it, rent it, or share it with anyone outside the shop.',
    ],
  },
  {
    heading: 'Analytics',
    paragraphs: [
      'We use Google Analytics to see basic visit numbers: which pages get read and roughly where visitors come from. That helps us keep the site useful. Google Analytics sets cookies and processes visit data under its own privacy policy.',
    ],
  },
  {
    heading: 'Embedded services',
    paragraphs: [
      /* Straight apostrophe, double-quoted string. This was the only
         curly U+2019 in the public source tree; every other possessive
         on the site is ASCII, so the two glyph shapes sat side by side
         across pages. */
      "The contact page embeds a Google map, the reviews page shows reviews from our Google Business listing, the contact form uses Cloudflare Turnstile to block spam, and the online shop page embeds our supplier catalog. Each of those loads from its provider and is covered by that provider's own privacy policy.",
    ],
  },
  {
    heading: 'Your machine and your data',
    paragraphs: [
      'Repair work is separate from this website. When you bring a machine in, your files stay on your machine, in our shop, and nothing about your repair goes through this site.',
    ],
  },
  {
    heading: 'Questions',
    paragraphs: [
      `Ask at the counter, or call the shop. This policy covers computerstoreks.com and was last reviewed in August 2026.`,
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <Section tone="wash" rhythm="compact">
        <Eyebrow>{BUSINESS_INFO.name}</Eyebrow>
        <h1 className="mt-4">Privacy policy</h1>
        <p className="mt-6 max-w-measure text-lg">
          The short version: the only thing this site collects is what you type into the
          contact form, and we use it to answer you.
        </p>
      </Section>

      <Section tone="page" rhythm="standard">
        <div className="max-w-3xl space-y-12">
          {POLICY_SECTIONS.map(({ heading, paragraphs }) => (
            <section key={heading}>
              <h2 className="text-title-sm">{heading}</h2>
              <div className="mt-4 space-y-4">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="max-w-measure">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
          <p className="max-w-measure">
            Call us at <PhoneLink variant="inline" /> or visit the shop at{' '}
            {BUSINESS_INFO.address}.
          </p>
        </div>
      </Section>
    </>
  );
}
