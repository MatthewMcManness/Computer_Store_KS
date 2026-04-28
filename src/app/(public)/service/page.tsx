/**
 * SERVICE CALL PAGE - Renders the hero and the contact form + sidebar block,
 * defaulting to "house-call" mode so the Availability field is shown and the
 * Service Call Rates sidebar (Standard / Silver / Silver+) appears alongside.
 * The form and sidebar live in contact-with-sidebar.tsx so the panels can
 * swap if the customer picks a different mode.
 *
 * WHEN TO EDIT: When changing the service call page hero or layout (form
 * logic is in contact-form.tsx; sidebar variants are in contact-with-sidebar.tsx).
 */

import { ContactWithSidebar } from '@/components/forms/contact-with-sidebar';

export default function ServicePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1548783300-85f8b16a0c38?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Schedule a Service Call</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">We come to you! Book a house call and our technician will fix your computer on-site.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="hero-next-section py-20 -mt-20 pt-32 relative z-[1]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <ContactWithSidebar initialMode="house-call" />
        </div>
      </section>
    </>
  );
}
