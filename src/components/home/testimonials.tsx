'use client';

import * as React from 'react';
import { Container } from '@/components/layout/container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Topeka, KS',
    rating: 5,
    text: 'Excellent service! They fixed my laptop quickly and at a fair price. The staff was knowledgeable and professional. Highly recommend!',
  },
  {
    id: 2,
    name: 'Mike Thompson',
    location: 'Lawrence, KS',
    rating: 5,
    text: 'I bought a refurbished desktop and it runs perfectly. Great value for the money. They even helped me set it up and transfer my files.',
  },
  {
    id: 3,
    name: 'Jennifer Davis',
    location: 'Topeka, KS',
    rating: 5,
    text: 'They recovered all my photos from a crashed hard drive. I thought I had lost 10 years of family memories. Absolute lifesavers!',
  },
  {
    id: 4,
    name: 'Robert Wilson',
    location: 'Manhattan, KS',
    rating: 5,
    text: 'Professional service and knowledgeable staff. This is my go-to computer store for repairs and upgrades. Always fair prices.',
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState(true);

  const nextTestimonial = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];
  if (!currentTestimonial) return null;

  React.useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextTestimonial]);

  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what our customers have to say.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div
          className="relative mt-12"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <Card className="mx-auto max-w-3xl">
            <CardContent className="p-8 sm:p-12">
              <Quote className="mb-6 h-10 w-10 text-primary-200" />

              <p className="text-lg text-foreground sm:text-xl">
                &ldquo;{currentTestimonial.text}&rdquo;
              </p>

              <div className="mt-6">
                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="mt-4">
                  <p className="font-semibold text-foreground">
                    {currentTestimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
