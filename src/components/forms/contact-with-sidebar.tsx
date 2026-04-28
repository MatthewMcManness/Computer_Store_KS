/**
 * CONTACT WITH SIDEBAR - Renders the contact form alongside a context-aware
 * sidebar panel. The sidebar swaps based on the form's current mode:
 *   - house-call: shows Service Call Rates (Standard / Silver / Silver+ / Platinum)
 *   - in-store / general: shows Visit Us info (address, phone, email, hours, map)
 * Used by the /contact page; can be embedded elsewhere with a different
 * initialMode if another entry point ever needs to default to house-call.
 *
 * WHEN TO EDIT: When changing the sidebar copy, pricing, store info, or
 * the rule that decides which sidebar to show for a given mode.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { LOCATIONS } from '@/lib/constants';
import { ContactForm, type ContactFormMode } from './contact-form';

interface ContactWithSidebarProps {
  initialMode?: ContactFormMode;
}

export function ContactWithSidebar({ initialMode = 'general' }: ContactWithSidebarProps) {
  const [currentMode, setCurrentMode] = React.useState<ContactFormMode>(initialMode);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1200px] mx-auto">
      <ContactForm mode={initialMode} onModeChange={setCurrentMode} />
      {currentMode === 'house-call' ? <HouseCallSidebar /> : <StoreInfoSidebar />}
    </div>
  );
}

function StoreInfoSidebar() {
  const loc = LOCATIONS.topeka;
  return (
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
  );
}

function HouseCallSidebar() {
  return (
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
        <p className="text-gray-700 m-0 text-2xl font-bold">$40 <span className="text-base font-normal text-gray-500">/ hour</span></p>
      </div>

      <div className="p-6 rounded-brand-md border-l-4" style={{ borderColor: '#6b7280', background: 'linear-gradient(145deg, #f4f6f8 0%, #d8dde3 100%)' }}>
        <h3 className="text-[1.125rem] mb-1 font-semibold" style={{ color: '#6b7280' }}>Platinum Members</h3>
        <p className="text-gray-700 m-0 text-2xl font-bold">$35 <span className="text-base font-normal text-gray-500">/ hour</span></p>
      </div>

      <Link href="/silver-plan" className="btn-silver text-center">
        Learn More About Protection Plans
      </Link>
    </div>
  );
}
