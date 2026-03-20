'use client';

import { useState, FormEvent } from 'react';
import { LOCATIONS } from '@/lib/constants';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const loc = LOCATIONS.topeka;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, location: loc.name }),
      });

      if (response.ok) {
        setStatus('success');
        setStatusMessage('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', phone: '', subject: 'General', message: '' });
      } else {
        setStatus('error');
        setStatusMessage('There was an error sending your message. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('There was an error sending your message. Please try again.');
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)' }}
      >
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] mb-6 font-bold">Contact Us</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Get in touch with Computer Store Kansas - we&apos;re here to help!</p>
        </div>
      </section>

      {/* Contact Main Content */}
      <section className="hero-next-section py-20 -mt-20 pt-32 relative z-[1]">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1200px] mx-auto">
            {/* Left: Contact Form */}
            <div className="bg-white p-8 rounded-brand-lg shadow-brand-md">
              <h2 className="text-[1.75rem] text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="contact-name" className="block font-semibold text-gray-900 mb-2">Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full py-3 px-4 border border-gray-300 rounded-brand-md text-base transition-colors duration-300 focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/10"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-email" className="block font-semibold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full py-3 px-4 border border-gray-300 rounded-brand-md text-base transition-colors duration-300 focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/10"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-phone" className="block font-semibold text-gray-900 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full py-3 px-4 border border-gray-300 rounded-brand-md text-base transition-colors duration-300 focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/10"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-subject" className="block font-semibold text-gray-900 mb-2">Subject</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full py-3 px-4 border border-gray-300 rounded-brand-md text-base transition-colors duration-300 bg-white focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/10"
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Repair">Computer Repair</option>
                    <option value="Custom Build">Custom Build</option>
                    <option value="Protection Plans">Protection Plans</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-message" className="block font-semibold text-gray-900 mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder="Tell us how we can help..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full py-3 px-4 border border-gray-300 rounded-brand-md text-base transition-colors duration-300 font-[inherit] focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/10"
                  />
                </div>
                <div className="text-center mt-6">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary-600 text-white border-none rounded-brand-md text-base font-semibold cursor-pointer transition-colors duration-300 hover:bg-primary-800 disabled:opacity-50"
                    disabled={status === 'loading'}
                  >
                    <span>
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                    </span>
                  </button>
                  {statusMessage && (
                    <div
                      className={`mt-4 p-2 rounded-brand-sm text-center font-medium min-h-[24px] ${
                        status === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}
                      aria-live="polite"
                    >
                      {statusMessage}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Business Info */}
            <div className="flex flex-col gap-6">
              <h2 className="text-[1.75rem] text-gray-900 mb-4">Visit Us</h2>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Address</h3>
                <p className="text-gray-700 m-0 leading-relaxed">{loc.addressLine1}<br />{loc.city}, {loc.state} {loc.zip}</p>
              </div>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Phone</h3>
                <p className="text-gray-700 m-0 leading-relaxed"><a href={`tel:${loc.phone}`} className="text-primary-600 no-underline transition-colors duration-300 hover:text-primary-800 hover:underline">{loc.phone}</a></p>
              </div>
              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-2">Email</h3>
                <p className="text-gray-700 m-0 leading-relaxed"><a href="mailto:contact@computerstoreks.com" className="text-primary-600 no-underline transition-colors duration-300 hover:text-primary-800 hover:underline">contact@computerstoreks.com</a></p>
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
