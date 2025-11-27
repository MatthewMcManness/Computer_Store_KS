import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Monitor, Cpu, HardDrive, ArrowRight } from 'lucide-react';

const iconMap = {
  Wrench,
  Monitor,
  Cpu,
  HardDrive,
};

const services = [
  {
    id: 'repair',
    title: 'Computer Repair',
    description: 'Expert diagnosis and repair for all PC and laptop issues. We fix hardware, software, and connectivity problems.',
    icon: 'Wrench',
  },
  {
    id: 'sales',
    title: 'Refurbished Computers',
    description: 'Quality tested and certified refurbished desktops and laptops at affordable prices with warranty.',
    icon: 'Monitor',
  },
  {
    id: 'custom',
    title: 'Custom Builds',
    description: 'Tailored computer builds to meet your specific needs for gaming, work, or home use.',
    icon: 'Cpu',
  },
  {
    id: 'data',
    title: 'Data Recovery',
    description: 'Recover your important files from damaged, failed, or corrupted hard drives and storage devices.',
    icon: 'HardDrive',
  },
];

export function ServicesPreview() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Services
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional computer services you can trust. From repairs to custom builds, we have you covered.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <Card key={service.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/services">
            <Button variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              View All Services
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
