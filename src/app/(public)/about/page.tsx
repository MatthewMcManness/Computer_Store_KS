import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us - Locally Owned Since 2003',
  description: "Learn about Computer Store Kansas - Topeka's oldest locally owned computer repair shop since 2003. Meet our team and discover why customers trust us for computer services.",
  openGraph: {
    title: 'About Us - Computer Store Kansas',
    description: "Topeka's oldest locally owned computer repair shop since 2003. Learn about our story and commitment to quality service.",
    url: 'https://computerstoreks.com/about',
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h2>About Us</h2>
          <p>Who we are and why we love fixing computers.</p>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="about horizontal-diamond texture-dots overlap-card-container">
        <div className="diamond-accent diamond-accent-2"></div>
        <div className="container overlap-card">
          <h2>Our Story</h2>
          <p>The Computer Store has been proudly serving the Topeka community since 2003. We&apos;re passionate about helping our customers get the most out of their technology with fast, friendly and honest service.</p>
          <p>Our technicians are certified and experienced in working with all major brands and systems. From virus removal and data recovery to upgrades and custom PC builds, we provide a full range of computer services for homes and small businesses.</p>
          <p>When you work with us, you&apos;re not just another ticket — you&apos;re part of our community.</p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="services">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="cards">
            <div className="card">
              <h3>Reliability</h3>
              <p>Count on us for dependable repairs and support you can trust.</p>
            </div>
            <div className="card">
              <h3>Personalized Approach</h3>
              <p>Solutions tailored to your unique needs and budget.</p>
            </div>
            <div className="card">
              <h3>Timely Delivery</h3>
              <p>Quick turnaround so you&apos;re back up and running fast.</p>
            </div>
            <div className="card">
              <h3>High Standards</h3>
              <p>Quality workmanship backed by decades of experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Experience the Difference?</h2>
          <p>Contact us today to schedule an appointment or drop by our shop. We look forward to serving you.</p>
          <Link href="/contact" className="btn btn-white">Get Your Free Quote</Link>
        </div>
      </section>
    </>
  );
}
