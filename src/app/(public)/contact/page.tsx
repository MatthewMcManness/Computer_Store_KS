'use client';

import { useState, FormEvent } from 'react';
import { LOCATIONS, LocationKey } from '@/lib/constants';

export default function ContactPage() {
  const [location, setLocation] = useState<LocationKey>('topeka');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const loc = LOCATIONS[location];

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
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80)' }}>
        <div className="container">
          <h2>Contact Us</h2>
          <p>Get in touch with Computer Store Kansas - we&apos;re here to help!</p>
          <div className="location-toggle">
            <button
              className={`location-toggle-btn ${location === 'topeka' ? 'active' : ''}`}
              onClick={() => setLocation('topeka')}
              type="button"
            >
              Topeka
            </button>
            <button
              className={`location-toggle-btn ${location === 'holton' ? 'active' : ''}`}
              onClick={() => setLocation('holton')}
              type="button"
            >
              Holton
            </button>
          </div>
        </div>
      </section>

      {/* Contact Main Content */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Form */}
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="contact-name">Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    placeholder="Your email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Repair">Computer Repair</option>
                    <option value="Custom Build">Custom Build</option>
                    <option value="Protection Plans">Protection Plans</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder="Tell us how we can help..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                    <span className="btn-text">
                      {status === 'loading' ? 'Sending...' : 'Send Message'}
                    </span>
                  </button>
                  {statusMessage && (
                    <div className={`form-status ${status}`} aria-live="polite">
                      {statusMessage}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Business Info */}
            <div className="contact-info-section">
              <h2>Visit Us — {loc.name}</h2>
              <div className="info-block">
                <h3>Address</h3>
                <p>{loc.addressLine1}<br />{loc.city}, {loc.state} {loc.zip}</p>
              </div>
              <div className="info-block">
                <h3>Phone</h3>
                <p><a href={`tel:${loc.phone}`}>{loc.phone}</a></p>
              </div>
              <div className="info-block">
                <h3>Email</h3>
                <p><a href="mailto:contact@computerstoreks.com">contact@computerstoreks.com</a></p>
              </div>
              <div className="info-block">
                <h3>Hours</h3>
                <p>
                  {loc.hours.map((line, i) => (
                    <span key={i}>{line}{i < loc.hours.length - 1 && <br />}</span>
                  ))}
                </p>
              </div>
              <div className="map-container">
                <iframe
                  src={loc.mapsEmbed}
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Computer Store Kansas ${loc.name} Location`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
