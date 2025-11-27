import * as React from 'react';
import { Container } from '@/components/layout/container';

const stats = [
  {
    value: '20+',
    label: 'Years in Business',
    description: 'Serving Topeka since 2003',
  },
  {
    value: '10,000+',
    label: 'Happy Customers',
    description: 'And counting every day',
  },
  {
    value: '25,000+',
    label: 'Computers Repaired',
    description: 'Desktops and laptops',
  },
  {
    value: '98%',
    label: 'Satisfaction Rate',
    description: 'Based on customer reviews',
  },
];

export function StatsSection() {
  return (
    <section className="border-y bg-white py-12 sm:py-16">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-primary-600 sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-semibold text-foreground">
                {stat.label}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
