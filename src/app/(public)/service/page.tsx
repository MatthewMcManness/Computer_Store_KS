/**
 * SERVICE CALL PAGE - Dedicated page for scheduling house call appointments.
 * Customers fill out the form to request an on-site technician visit.
 *
 * WHEN TO EDIT: When changing the service call page layout, copy, or pricing.
 */
'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';

export default function ServicePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    availability: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: 'Schedule a Service Call',
          message: `Availability: ${formData.availability}\n\n${formData.message}`,
        }),
      });
      if (response.ok) {
        setStatus('success');
        setStatusMessage('Thank you! We\'ll be in touch soon to confirm your appointment.');
        setFormData({ name: '', email: '', phone: '', availability: '', message: '' });
      } else {
        setStatus('error');
        setStatusMessage('There was an error sending your request. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('There was an error sending your request. Please try again.');
    }
  };

  const fieldClass = 'flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';
  const labelClass = 'mb-2 block text-sm font-medium text-gray-800';

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Left: Form */}
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-md border border-bg-dark">
              <h2 className="text-[1.75rem] text-gray-900 mb-2">Request an Appointment</h2>
              <p className="text-gray-600 mb-6 text-sm">Fill out the form below and we&apos;ll get back to you to confirm your service call.</p>

              {status === 'success' && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 text-sm font-medium">{statusMessage}</div>
              )}
              {status === 'error' && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 text-sm font-medium">{statusMessage}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sc-name" className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                    <input id="sc-name" type="text" required placeholder="John Doe" className={fieldClass}
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="sc-email" className={labelClass}>Email <span className="text-red-500">*</span></label>
                    <input id="sc-email" type="email" required placeholder="john@example.com" className={fieldClass}
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sc-phone" className={labelClass}>Phone Number</label>
                    <input id="sc-phone" type="tel" placeholder="(785) 555-0123" className={fieldClass}
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="sc-subject" className={labelClass}>Subject</label>
                    <input id="sc-subject" type="text" readOnly value="Schedule a Service Call"
                      className={`${fieldClass} bg-gray-50 text-gray-500 cursor-default`} />
                  </div>
                </div>

                <div>
                  <label htmlFor="sc-availability" className={labelClass}>Best Days &amp; Times <span className="text-red-500">*</span></label>
                  <textarea id="sc-availability" required rows={3}
                    placeholder="e.g. Monday or Wednesday afternoons, any time after 2pm..."
                    className={fieldClass}
                    value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} />
                </div>

                <div>
                  <label htmlFor="sc-message" className={labelClass}>Describe the Issue <span className="text-red-500">*</span></label>
                  <textarea id="sc-message" required rows={4}
                    placeholder="Tell us what's going on with your computer..."
                    className={fieldClass}
                    value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>

                <button type="submit" disabled={status === 'loading'}
                  className="w-full inline-block px-8 py-4 rounded-brand-md font-semibold text-base transition-all duration-300 bg-primary-600 text-white shadow-brand-sm hover:bg-primary-800 hover:-translate-y-0.5 hover:shadow-brand-md disabled:opacity-60 disabled:cursor-not-allowed">
                  {status === 'loading' ? 'Sending...' : 'Request Service Call'}
                </button>
              </form>
            </div>

            {/* Right: Pricing Info */}
            <div className="flex flex-col gap-6">
              <h2 className="text-[1.75rem] text-gray-900 mb-4">Service Call Rates</h2>

              <div className="bg-bg-light p-6 rounded-brand-md border-l-4 border-primary-600">
                <h3 className="text-[1.125rem] text-primary-600 mb-1 font-semibold">Standard Rate</h3>
                <p className="text-gray-700 m-0 text-2xl font-bold">$100 <span className="text-base font-normal text-gray-500">/ hour</span></p>
              </div>

              <div className="p-6 rounded-brand-md border-l-4" style={{ borderColor: '#a8a8a8', background: 'linear-gradient(145deg, #f8f8f8 0%, #e8e8e8 100%)' }}>
                <h3 className="text-[1.125rem] mb-1 font-semibold" style={{ color: '#707070' }}>Silver Plan Members</h3>
                <p className="text-gray-700 m-0 text-2xl font-bold">$50 <span className="text-base font-normal text-gray-500">/ hour</span></p>
              </div>

              <div className="p-6 rounded-brand-md border-l-4" style={{ borderColor: '#b8860b', background: 'linear-gradient(145deg, #fffdf0 0%, #fef9d0 100%)' }}>
                <h3 className="text-[1.125rem] mb-1 font-semibold gold-text">Silver+ Members</h3>
                <p className="text-gray-700 m-0 text-2xl font-bold">$35 <span className="text-base font-normal text-gray-500">/ hour</span></p>
              </div>

              <Link href="/silver-plan" className="btn-silver text-center">
                Learn More About Silver Plans
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
