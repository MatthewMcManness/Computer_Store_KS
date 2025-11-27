import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { ServicesPreview } from '@/components/home/services-preview';
import { StatsSection } from '@/components/home/stats-section';
import { Testimonials } from '@/components/home/testimonials';
import { CtaSection } from '@/components/home/cta-section';
import { BUSINESS_INFO } from '@/lib/constants';

export const metadata: Metadata = {
  title: `${BUSINESS_INFO.name} | Computer Sales & Repair in Topeka, KS`,
  description: `Your trusted computer experts in Topeka, Kansas. Quality refurbished computers, expert repairs, custom builds, and exceptional customer service since ${BUSINESS_INFO.founded}. Call ${BUSINESS_INFO.phoneFormatted} today!`,
  openGraph: {
    title: `${BUSINESS_INFO.name} | Computer Sales & Repair in Topeka, KS`,
    description: `Your trusted computer experts in Topeka, Kansas. Quality refurbished computers, expert repairs, and custom builds since ${BUSINESS_INFO.founded}.`,
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <StatsSection />
      <Testimonials />
      <CtaSection />
    </>
  );
}
