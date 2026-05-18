/**
 * REVIEWS PAGE - Displays customer reviews and testimonials.
 *
 * WHEN TO EDIT: When changing how reviews are shown.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewsDisplay } from '@/components/reviews/ReviewsDisplay';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  title: 'Customer Reviews - Computer Store Kansas',
  description: 'Read what our customers say about Computer Store Kansas. Trusted computer repair services in Topeka since 2003 with 5-star reviews.',
  openGraph: {
    title: 'Customer Reviews - Computer Store Kansas',
    description: 'See why Topeka trusts us for computer repair. Read authentic customer reviews.',
    url: 'https://computerstoreks.com/reviews',
  },
};

export default function ReviewsPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection
        bottomShape="v"
        className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Customer Reviews</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">See what our customers are saying about us.</p>
        </div>
      </ChevronSection>

      {/* Reviews Section */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-bg-light relative">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <ReviewsDisplay />
        </div>
      </ChevronSection>

      {/* Leave Review CTA */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Had a Great Experience?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">We&apos;d love to hear from you! Leave us a review on Google.</p>
          <a
            href="https://g.page/r/CQdWo7o2FwEZEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-inverse"
          >
            Leave a Review
          </a>
        </div>
      </ChevronSection>

      {/* Contact CTA */}
      <ChevronSection topShape="v" className="texture-dots bg-gradient-to-br from-[#e8f0fe] to-[#d6e4fd] py-20 relative overflow-hidden">
        <div className="diamond-accent -bottom-[50px] left-[5%] w-[120px] h-[120px]"></div>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-8 text-gray-900">Ready to Experience Our Service?</h2>
          <p className="max-w-[800px] mx-auto mb-6 text-[1.05rem] leading-[1.8] text-center text-gray-700">Join our satisfied customers. Contact us today for fast, friendly, and affordable computer repair.</p>
          <div className="text-center">
            <Link href="/contact" className="cta-primary">Contact Us</Link>
          </div>
        </div>
      </ChevronSection>
    </>
  );
}
