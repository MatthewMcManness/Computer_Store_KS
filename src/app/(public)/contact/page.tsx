/**
 * CONTACT PAGE - Renders the hero and the contact form + sidebar block.
 * Defaults to "General question" mode. The form and the sidebar that swaps
 * with mode (Visit Us ↔ Service Call Rates) live in contact-with-sidebar.tsx.
 *
 * WHEN TO EDIT: When changing the contact page hero or layout (form logic
 * is in contact-form.tsx; sidebar variants are in contact-with-sidebar.tsx).
 */
import { ContactWithSidebar } from '@/components/forms/contact-with-sidebar';
import { ChevronSection } from '@/components/static/ChevronSection';

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection
        bottomShape="v"
        className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Contact Us</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Get in touch with Computer Store Kansas - we&apos;re here to help!</p>
        </div>
      </ChevronSection>

      {/* Contact Main Content */}
      <ChevronSection topShape="v" className="py-20 relative">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <ContactWithSidebar />
        </div>
      </ChevronSection>
    </>
  );
}
