'use client';

import * as React from 'react';
import { Phone, MessageSquare, X, Mail, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Floating contact widget that provides quick access to contact options.
 * Shows on desktop as a floating button that expands to show contact options.
 */
export function ContactWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Show widget after user has been on page for a few seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = BUSINESS_INFO.phone.replace(/\D/g, '');

  const contactOptions = [
    {
      label: 'Call Us',
      sublabel: 'Talk to an expert now',
      icon: Phone,
      href: `tel:${phoneNumber}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Text Us',
      sublabel: 'Send a quick text',
      icon: MessageSquare,
      href: `sms:${phoneNumber}`,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Email Us',
      sublabel: 'We reply within 24hrs',
      icon: Mail,
      href: `mailto:${BUSINESS_INFO.email}`,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block">
      {/* Contact Options Panel */}
      <div
        className={cn(
          'absolute bottom-16 right-0 mb-2 w-64 overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300',
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
      >
        <div className="bg-primary-600 px-4 py-3">
          <h3 className="font-semibold text-white">How can we help?</h3>
          <p className="text-sm text-primary-100">Choose how you&apos;d like to reach us</p>
        </div>
        <div className="p-2">
          {contactOptions.map((option) => (
            <a
              key={option.label}
              href={option.href}
              className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              <div className={cn('rounded-full p-2 text-white', option.color)}>
                <option.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500">{option.sublabel}</div>
              </div>
            </a>
          ))}
        </div>
        <div className="border-t bg-gray-50 px-4 py-2">
          <p className="text-center text-xs text-gray-500">
            Open {BUSINESS_INFO.hours[0]}
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          'hover:scale-110 active:scale-95',
          isOpen ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary-600 hover:bg-primary-700'
        )}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Attention Pulse - only when closed */}
      {!isOpen && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 rounded-full bg-primary-500"></span>
        </span>
      )}
    </div>
  );
}
