/**
 * SERVICES HUB - Overview page listing all services the store offers, with links to detail pages.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ScanSearch,
  Bug,
  HardDriveDownload,
  MonitorDown,
  Cpu,
  Gauge,
  ShieldCheck,
  Computer,
  Laptop,
  Monitor,
  Printer,
  Recycle,
  BadgeCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { ChevronSection } from '@/components/static/ChevronSection';

export const metadata: Metadata = {
  alternates: { canonical: '/services' },
  title: 'Computer Repair Services in Topeka, KS',
  description: 'Computer repair services in Topeka, KS - diagnostics, virus removal, hardware upgrades, data services, OS installation, and custom PC builds. Professional computer service since 2003.',
  openGraph: {
    title: 'Computer Repair Services - Computer Store Kansas',
    description: 'Professional computer repair services in Topeka: diagnostics, virus removal, hardware upgrades, data services, and custom builds.',
    url: 'https://computerstoreks.com/services',
  },
};

interface Service {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  featured?: boolean;
  silver?: boolean;
}

/** The three flagship services, surfaced in the Featured section up top. */
const featuredServices: { href: string; title: string; description: string; Icon: LucideIcon; cta: string }[] = [
  {
    href: '/services/custom-computers',
    title: 'Custom-Built PCs',
    description: 'Your vision, expertly built. Gaming rigs, workstations, and servers assembled with quality parts and clean cable management. Free lifetime diagnostics on every build.',
    Icon: Computer,
    cta: 'Build Yours',
  },
  {
    href: '/silver-plan',
    title: 'Protection Plans',
    description: 'Bronze, Silver, and Gold plans bundle antivirus, repair discounts, and priority service into ongoing peace of mind for your computer.',
    Icon: BadgeCheck,
    cta: 'Compare Plans',
  },
  {
    href: '/services/recycling',
    title: 'Free Electronics Recycling',
    description: 'Drop off old computers, TVs, consoles, and more at no cost. Guaranteed data destruction and responsible disposal that keeps e-waste out of the landfill.',
    Icon: Recycle,
    cta: 'Learn More',
  },
];

const services: Service[] = [
  {
    href: '/services/diagnostics',
    title: 'Diagnostics',
    description: 'Thorough troubleshooting to identify issues quickly and accurately. Diagnostic fee rolls into the repair cost.',
    Icon: ScanSearch,
  },
  {
    href: '/services/virus-removal',
    title: 'Virus & Malware Removal',
    description: 'Complete removal of viruses, malware, spyware, and rootkits. Your computer returned clean and protected.',
    Icon: Bug,
  },
  {
    href: '/services/data-services',
    title: 'Data Transfer & Cloning',
    description: 'Move your files, settings, and programs to a new computer. Drive cloning and data recovery available.',
    Icon: HardDriveDownload,
  },
  {
    href: '/services/os-installation',
    title: 'OS Installation',
    description: 'Fresh Windows or Linux installation. Dual-boot setups available. Windows license included.',
    Icon: MonitorDown,
  },
  {
    href: '/services/upgrades',
    title: 'Hardware Upgrades',
    description: 'RAM, SSD, graphics cards, processors, and more. Breathe new life into your existing computer.',
    Icon: Cpu,
  },
  {
    href: '/services/debloat',
    title: 'Windows Debloat',
    description: 'Remove bloatware and optimize Windows for speed. Free on all computers purchased from us.',
    Icon: Gauge,
  },
  {
    href: '/services/antivirus',
    title: 'Antivirus & Protection',
    description: 'Professional antivirus software installation and scam protection to keep you safe online.',
    Icon: ShieldCheck,
  },
  {
    href: '/services/custom-computers',
    title: 'Custom-Built PCs',
    description: 'Gaming rigs, workstations, home offices, and servers. Quality parts, expert assembly, free lifetime diagnostics.',
    Icon: Computer,
    featured: true,
  },
  {
    href: '/services/laptops',
    title: 'Laptops',
    description: 'New Asus and Lenovo laptops, plus quality refurbished options. Custom orders available.',
    Icon: Laptop,
  },
  {
    href: '/services/desktops',
    title: 'Refurbished Desktops',
    description: 'Quality refurbished desktop computers. Cleaned, tested, and ready to work for years to come.',
    Icon: Monitor,
  },
  {
    href: '/services/printers',
    title: 'Printers',
    description: 'New Brother printers for sale plus repair service for Brother and other brands. $50 in-home setup with purchase.',
    Icon: Printer,
  },
  {
    href: '/services/recycling',
    title: 'Free Electronics Recycling',
    description: 'Drop off old computers, TVs, radios, consoles, and more. Data destruction guaranteed. No cost to you.',
    Icon: Recycle,
  },
  {
    href: '/silver-plan',
    title: 'Protection Plans',
    description: 'Bronze, Silver, and Gold protection plans with antivirus, discounts on repairs, priority service, and peace of mind.',
    Icon: BadgeCheck,
    silver: true,
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <ChevronSection bottomShape="v" className="hero-overlay text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1597673030062-0a0f1a801a31?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h1>Our Services</h1>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Comprehensive support for your computers and devices.</p>
        </div>
      </ChevronSection>

      {/* Featured Section */}
      <ChevronSection topShape="v" bottomShape="v" className="texture-circuit py-20 relative bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Featured Services</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-12 max-w-[700px] mx-auto">The work our customers come back for, again and again.</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
            {featuredServices.map((service) => (
              <Link key={service.href} href={service.href} className="group no-underline text-inherit block">
                <div className="h-full bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark flex flex-col transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-300">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-brand-md bg-primary-600 text-white mb-5">
                    <service.Icon className="w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="text-[1.35rem] text-gray-900 mb-3 leading-tight">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">{service.description}</p>
                  <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1.5 mt-auto transition-all duration-fast group-hover:gap-2.5">
                    {service.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </ChevronSection>

      {/* All Services */}
      <ChevronSection topShape="v" bottomShape="v" className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">All Services</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Click any service to learn more about what we offer.</p>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 mt-8">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className={`group service-card-bar flex flex-col bg-white rounded-brand-lg p-7 shadow-brand-md transition-all duration-normal no-underline text-inherit border-2 border-transparent relative overflow-hidden hover:-translate-y-1 hover:shadow-brand-lg hover:border-primary-300 ${service.featured ? 'featured border-primary-600 bg-[linear-gradient(135deg,white_0%,rgba(37,99,235,0.03)_100%)]' : ''} ${service.silver ? 'service-card-silver' : ''}`}
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-brand-md bg-primary-100 text-primary-600 mb-4">
                  <service.Icon className="w-7 h-7" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="text-[1.25rem] text-gray-900 mb-3 leading-tight">{service.title}</h3>
                <p className="text-[0.95rem] text-gray-600 leading-relaxed mb-4 flex-1">{service.description}</p>
                <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1.5 mt-auto transition-all duration-fast group-hover:gap-2.5">View Details <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </ChevronSection>

      {/* Not Sure Section */}
      <ChevronSection topShape="v" bottomShape="v" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Not Sure What You Need?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll take a look. Our diagnostic fee rolls into the repair cost if you proceed—no pressure, just honest advice.</p>
          <Link href="/services/diagnostics" className="cta-inverse">Learn About Diagnostics</Link>
        </div>
      </ChevronSection>

      {/* Call-to-Action Section */}
      <ChevronSection topShape="v" bottomShape="flat" className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Get Started?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us to discuss your needs or bring your computer in for service.</p>
          <Link href="/contact" className="cta-inverse">Get Your Free Quote</Link>
        </div>
      </ChevronSection>
    </>
  );
}
