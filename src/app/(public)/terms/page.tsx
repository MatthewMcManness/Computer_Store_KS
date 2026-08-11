/**
 * TERMS OF USE PAGE - Plain-spoken terms for the website itself,
 * including the copyright notice Max asked for after another shop
 * copied the site. Service work is governed by what we agree at the
 * counter, not by this page.
 *
 * WHEN TO EDIT: When Max revises the wording or the site gains a
 * feature these terms should cover. Contact facts live in constants.ts.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { PhoneLink } from '@/components/ui/phone-link';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

/** One description string for the meta tag and the share card. */
const PAGE_DESCRIPTION = `The terms for using the ${BUSINESS_INFO.name} website: what the content is for, who owns it, and how service work is actually agreed.`;

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Use',
  description: PAGE_DESCRIPTION,
  path: '/terms',
  shareTitle: 'Terms of use',
});

/** The terms content: heading plus plain paragraphs. */
const TERMS_SECTIONS = [
  {
    heading: 'What this site is',
    paragraphs: [
      `This website describes the services of ${BUSINESS_INFO.name} in Topeka, Kansas. The information here is general. Every machine is different, so what your repair needs and costs is set when we look at it, not by a page on this site.`,
      'Prices shown on the site, like the $50 diagnostic, are accurate when published. If a price changes, the number we quote you at the shop is the one that counts.',
    ],
  },
  {
    heading: 'Our content is ours',
    paragraphs: [
      `The text, photos, logo, and design of this site belong to ${BUSINESS_INFO.name} and are protected by copyright. Do not copy, reuse, or republish them without written permission from the shop. That includes copying pages or sections of this site for another business.`,
    ],
  },
  {
    heading: 'Outside links and embeds',
    paragraphs: [
      'The site links to and embeds a few outside services, like our Google listing and the online catalog our supplier runs. Those belong to their providers, and we are not responsible for their content.',
    ],
  },
  {
    heading: 'Service work',
    paragraphs: [
      'Repairs, builds, plans, and service calls are agreed directly between you and the shop, in person or on the phone. Nothing on this website creates a service agreement by itself.',
    ],
  },
  {
    heading: 'Questions',
    paragraphs: [
      'If any of this is unclear, ask. These terms cover computerstoreks.com and were last reviewed in August 2026.',
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <Section tone="wash" rhythm="compact">
        <Eyebrow>{BUSINESS_INFO.name}</Eyebrow>
        <h1 className="mt-4">Terms of use</h1>
        <p className="mt-6 max-w-measure text-lg">
          The short version: the site is here to tell you what the shop does, the real
          agreement happens at the counter, and the content on these pages is ours.
        </p>
      </Section>

      <Section tone="page" rhythm="standard">
        <div className="max-w-3xl space-y-12">
          {TERMS_SECTIONS.map(({ heading, paragraphs }) => (
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
