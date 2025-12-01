'use client';

import { useState, useEffect, useCallback } from 'react';

interface Testimonial {
  text: string;
  author: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Signing up for a Computer Protection Plan from The Computer Store was the best decision I've made in years. My computer has never run better and no more worries about spyware stealing my identity while online!",
    author: 'Kristina Jones',
    location: 'Topeka, KS',
  },
  {
    text: "When the Big Store told me they'd have to send my PC in and it would be 2-3 weeks, I decided to try a local store. Not only did The Computer Store fix my problem a lot faster, they did so at just under half the cost.",
    author: 'Matt',
    location: 'Topeka, KS',
  },
  {
    text: "My hard drive stopped working all together and I had no backup. I thought all was lost but the technician managed to get my drive working long enough to get the data onto another drive saving me a lot of headache and money — thank you Computer Store!",
    author: 'Andrew',
    location: 'Topeka, KS',
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <section className="testimonials">
      <div className="container">
        <h2>What Our Clients Say</h2>
        <div className="testimonials-carousel">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial">
                <div className="testimonial-content">
                  <div className="quote-icon">&#10077;</div>
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="quote-icon-close">&#10078;</div>
                  <div className="testimonial-author">
                    <div className="author-avatar">{testimonial.author[0]}</div>
                    <div className="author-details">
                      <h4>{testimonial.author}</h4>
                      <p className="author-location">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="carousel-arrow prev"
            aria-label="Previous testimonial"
            onClick={goToPrev}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            className="carousel-arrow next"
            aria-label="Next testimonial"
            onClick={goToNext}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div className="carousel-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              data-index={index}
              aria-label={`Go to testimonial ${index + 1}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
