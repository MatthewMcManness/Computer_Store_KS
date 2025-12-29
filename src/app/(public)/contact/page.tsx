'use client';

import { useState, FormEvent } from 'react';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
      <section className="hero">
        <div className="container">
          <h2>Contact Us</h2>
          <p>Get in touch with Computer Store Kansas - we&apos;re here to help!</p>
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
              <h2>Visit Us</h2>
              <div className="info-block">
                <h3>Address</h3>
                <p>2008 SW Gage Blvd<br />Topeka, KS 66604</p>
              </div>
              <div className="info-block">
                <h3>Phone</h3>
                <p><a href="tel:785-267-3223">785-267-3223</a></p>
              </div>
              <div className="info-block">
                <h3>Email</h3>
                <p><a href="mailto:contact@computerstoreks.com">contact@computerstoreks.com</a></p>
              </div>
              <div className="info-block">
                <h3>Hours</h3>
                <p>
                  Monday – Friday: 10:00 am – 6:00 pm<br />
                  Saturday: 10:00 am – 2:00 pm<br />
                  Sunday: Closed
                </p>
              </div>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3096.8876!2d-95.7028!3d39.0365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87bf02d8d9a9ed57%3A0x8a8a8a8a8a8a8a8a!2s2008%20SW%20Gage%20Blvd%2C%20Topeka%2C%20KS%2066604!5e0!3m2!1sen!2sus!4v1701417600000"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '8px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Computer Store Kansas Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
