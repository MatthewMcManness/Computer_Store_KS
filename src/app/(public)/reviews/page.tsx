/**
 * REVIEWS PAGE - Real cached Google reviews as an editorial quote
 * column, with a prominent write-a-review link and a closing call CTA.
 * Nothing on this page is invented; the empty state points to Google.
 *
 * WHEN TO EDIT: When changing the reviews page layout. The review
 * rendering itself lives in src/components/reviews/ReviewsDisplay.tsx.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CTALink } from '@/components/ui/cta-link';
import { ReviewsDisplay, loadCachedReviews } from '@/components/reviews/ReviewsDisplay';
import { CTABand } from '@/components/pages/cta-band';
import { BUSINESS_INFO } from '@/lib/constants';
import { pageMetadata } from '@/components/seo/site-meta';

/**
 * The description has to match what the page actually shows. With
 * nothing cached, the page is a pointer to the Google listing, so a
 * snippet promising reviews would be a promise the page does not keep.
 */
export async function generateMetadata(): Promise<Metadata> {
  const data = await loadCachedReviews();
  const description = data
    ? `Read real Google reviews of ${BUSINESS_INFO.name}, the in-house computer repair shop at ${BUSINESS_INFO.addressLine1} in ${BUSINESS_INFO.city}.`
    : `Every review of ${BUSINESS_INFO.name} lives on our Google listing. Call the shop at ${BUSINESS_INFO.phoneFormatted}, or read them at the source.`;

  return pageMetadata({
    title: 'Reviews, What Topeka Says',
    description,
    path: '/reviews',
    shareTitle: 'Reviews of the shop',
  });
}

/* Re-render hourly so the server-read reviews cache stays fresh. */
export const revalidate = 3600;

export default async function ReviewsPage() {
  /* Loaded here so the hero lede matches what is actually below it. An
     unconditional "these reviews come straight from our Google listing"
     over an empty column promises something the page does not deliver. */
  const data = await loadCachedReviews();

  return (
    <>
      {/* Hero: centered, unlike the left-aligned interior heroes; one
          write-a-review CTA for the whole page lives here */}
      <Section tone="wash" rhythm="hero" containerClassName="text-center">
        <Eyebrow>Google reviews</Eyebrow>
        <h1 className="mx-auto mt-4 max-w-[18ch]">What Topeka says</h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-lg">
          {/* In the empty state the band below carries the where, so the
              hero carries only the ask. Stating the Google listing twice
              in one viewport read as two authors who had not met. */}
          {data
            ? 'These reviews come straight from our Google listing, written by customers. If we have done work for you, a short review helps the next person decide.'
            : 'If we have done work for you, a short review helps the next person decide. It takes about a minute.'}
        </p>
        <div className="mt-8 flex justify-center">
          <CTALink href={BUSINESS_INFO.socialMedia.googleReview} variant="primary">
            Write a review
          </CTALink>
        </div>
      </Section>

      {/* The quote column (or the designed Google-listing panel when the
          cache is empty). ReviewsDisplay brings its own Section and sets
          the rhythm per state, so the rule-to-content gap stays tight. */}
      <ReviewsDisplay data={data} />

      <CTABand
        title="Ready when your machine is"
        line="Call the shop and tell us what is going on. The $50 diagnostic applies toward your repair."
      />
    </>
  );
}
