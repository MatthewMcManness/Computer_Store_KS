import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewsDisplay } from '@/components/reviews/ReviewsDisplay';

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
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1920&q=80)' }}>
        <div className="container">
          <h2>Customer Reviews</h2>
          <p>See what our customers are saying about us.</p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="services">
        <div className="container">
          <ReviewsDisplay />
        </div>
      </section>

      {/* Leave Review CTA */}
      <section className="cta">
        <div className="container">
          <h2>Had a Great Experience?</h2>
          <p>We&apos;d love to hear from you! Leave us a review on Google.</p>
          <a
            href="https://g.page/r/CQdWo7o2FwEZEAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-white"
          >
            Leave a Review
          </a>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="about horizontal-diamond texture-dots">
        <div className="diamond-accent diamond-accent-2"></div>
        <div className="container">
          <h2>Ready to Experience Our Service?</h2>
          <p>Join our satisfied customers. Contact us today for fast, friendly, and affordable computer repair.</p>
          <Link href="/contact" className="btn btn-primary">Contact Us</Link>
        </div>
      </section>
    </>
  );
}
