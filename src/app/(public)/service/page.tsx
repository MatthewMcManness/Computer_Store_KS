/**
 * SERVICE CALL PAGE - Dedicated page for scheduling house call appointments.
 * Customers fill out the contact form to request a technician visit.
 *
 * WHEN TO EDIT: When changing the service call page layout or copy.
 */
import { LOCATIONS } from '@/lib/constants';
import { ContactForm } from '@/components/forms/contact-form';

export default function ServicePage() {
  const loc = LOCATIONS.topeka;

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1200px] mx-auto">
            {/* Left: Contact Form */}
            <ContactForm />

            {/* Right: Service Info */}
            <div className="flex flex-col gap-6">
              <h2 className="text-[1.75rem] text-gray-900 mb-4">Service Area Info</h2>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Address</h3>
                <p className="text-gray-700 m-0 leading-relaxed">{loc.addressLine1}<br />{loc.city}, {loc.state} {loc.zip}</p>
              </div>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Phone</h3>
                <p className="text-gray-700 m-0 leading-relaxed">
                  <a href={`tel:${loc.phone}`} className="text-primary-600 no-underline transition-colors duration-300 hover:text-primary-800 hover:underline">{loc.phone}</a>
                </p>
              </div>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Email</h3>
                <p className="text-gray-700 m-0 leading-relaxed">
                  <a href="mailto:contact@computerstoreks.com" className="text-primary-600 no-underline transition-colors duration-300 hover:text-primary-800 hover:underline">contact@computerstoreks.com</a>
                </p>
              </div>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Hours</h3>
                <p className="text-gray-700 m-0 leading-relaxed">
                  {loc.hours.map((line, i) => (
                    <span key={i}>{line}{i < loc.hours.length - 1 && <br />}</span>
                  ))}
                </p>
              </div>
              <div>
                <iframe
                  src={loc.mapsEmbed}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Computer Store Kansas Topeka Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
