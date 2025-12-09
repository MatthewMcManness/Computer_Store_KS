'use client';

import * as React from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

/**
 * Floating chat widget for quick customer inquiries.
 * Collects name, email, and message then submits to the contact API.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [step, setStep] = React.useState<'greeting' | 'name' | 'email' | 'message' | 'sending' | 'sent' | 'error'>('greeting');
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Show widget after delay
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat when opened
  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hi there! 👋 I'm here to help you get in touch with our team. What's your name?");
      setStep('name');
    }
  }, [isOpen, messages.length]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'bot',
      text,
      timestamp: new Date(),
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      text,
      timestamp: new Date(),
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const value = inputValue.trim();
    addUserMessage(value);
    setInputValue('');

    switch (step) {
      case 'name':
        setFormData(prev => ({ ...prev, name: value }));
        setTimeout(() => {
          addBotMessage(`Nice to meet you, ${value}! What's your email address so we can get back to you?`);
          setStep('email');
        }, 500);
        break;

      case 'email':
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setTimeout(() => {
            addBotMessage("That doesn't look like a valid email. Could you try again?");
          }, 500);
          return;
        }
        setFormData(prev => ({ ...prev, email: value }));
        setTimeout(() => {
          addBotMessage("Great! Now, how can we help you today? Tell us about your computer issue or question.");
          setStep('message');
        }, 500);
        break;

      case 'message':
        setFormData(prev => ({ ...prev, message: value }));
        setStep('sending');

        // Submit to API
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              message: value,
              subject: 'General',
              _timing: Date.now().toString(),
            }),
          });

          if (response.ok) {
            setTimeout(() => {
              addBotMessage(`Thanks ${formData.name}! Your message has been sent. We'll get back to you at ${formData.email} within 24 hours. Need faster help? Give us a call!`);
              setStep('sent');
            }, 500);
          } else {
            throw new Error('Failed to send');
          }
        } catch {
          setTimeout(() => {
            addBotMessage("Sorry, there was a problem sending your message. Please try calling us or use the contact page.");
            setStep('error');
          }, 500);
        }
        break;
    }
  };

  const resetChat = () => {
    setMessages([]);
    setFormData({ name: '', email: '', message: '' });
    setStep('greeting');
    setInputValue('');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(resetChat, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:block">
      {/* Chat Panel */}
      <div
        className={cn(
          'absolute bottom-16 right-0 mb-2 w-80 overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300',
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
      >
        {/* Header */}
        <div className="bg-primary-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Quick Message</h3>
              <p className="text-sm text-primary-100">We typically reply within 24hrs</p>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-primary-100 hover:bg-primary-500 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                msg.type === 'bot'
                  ? 'bg-gray-100 text-gray-800'
                  : 'ml-auto bg-primary-600 text-white'
              )}
            >
              {msg.text}
            </div>
          ))}
          {step === 'sending' && (
            <div className="bg-gray-100 text-gray-800 max-w-[85%] rounded-lg px-3 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input or Actions */}
        <div className="border-t p-3">
          {step === 'sent' || step === 'error' ? (
            <div className="flex gap-2">
              <a
                href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
              <button
                onClick={resetChat}
                className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                New Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type={step === 'email' ? 'email' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  step === 'name' ? 'Your name...' :
                  step === 'email' ? 'your@email.com' :
                  'Type your message...'
                }
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                disabled={step === 'sending'}
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || step === 'sending'}
                className="rounded-lg bg-primary-600 p-2 text-white hover:bg-primary-700 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
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
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
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
