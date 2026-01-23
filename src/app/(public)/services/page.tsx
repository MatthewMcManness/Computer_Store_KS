import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Computer Repair Services in Topeka, KS',
  description: 'Computer repair services in Topeka, KS - diagnostics, virus removal, hardware upgrades, data services, OS installation, and custom PC builds. Professional computer service since 2003.',
  openGraph: {
    title: 'Computer Repair Services - Computer Store Kansas',
    description: 'Professional computer repair services in Topeka: diagnostics, virus removal, hardware upgrades, data services, and custom builds.',
    url: 'https://computerstoreks.com/services',
  },
};

const services = [
  {
    href: '/services/diagnostics',
    title: 'Diagnostics',
    description: 'Thorough troubleshooting to identify issues quickly and accurately. Diagnostic fee rolls into the repair cost.',
    icon: '🔍',
  },
  {
    href: '/services/virus-removal',
    title: 'Virus & Malware Removal',
    description: 'Complete removal of viruses, malware, spyware, and rootkits. Your computer returned clean and protected.',
    icon: '🛡️',
  },
  {
    href: '/services/data-services',
    title: 'Data Transfer & Cloning',
    description: 'Move your files, settings, and programs to a new computer. Drive cloning and data recovery available.',
    icon: '💾',
  },
  {
    href: '/services/os-installation',
    title: 'OS Installation',
    description: 'Fresh Windows or Linux installation. Dual-boot setups available. Windows license included.',
    icon: '💻',
  },
  {
    href: '/services/upgrades',
    title: 'Hardware Upgrades',
    description: 'RAM, SSD, graphics cards, processors, and more. Breathe new life into your existing computer.',
    icon: '⚡',
  },
  {
    href: '/services/debloat',
    title: 'Windows Debloat',
    description: 'Remove bloatware and optimize Windows for speed. Free on all computers purchased from us.',
    icon: '🧹',
  },
  {
    href: '/services/antivirus',
    title: 'Antivirus & Protection',
    description: 'Professional antivirus software installation and scam protection to keep you safe online.',
    icon: '🔒',
  },
  {
    href: '/services/custom-computers',
    title: 'Custom-Built PCs',
    description: 'Gaming rigs, workstations, home offices, and servers. Quality parts, expert assembly, free lifetime diagnostics.',
    icon: '🖥️',
    featured: true,
  },
  {
    href: '/services/laptops',
    title: 'Laptops',
    description: 'New Asus and Lenovo laptops, plus quality refurbished options. Custom orders available.',
    icon: '💼',
  },
  {
    href: '/services/desktops',
    title: 'Refurbished Desktops',
    description: 'Quality refurbished desktop computers. Cleaned, tested, and ready to work for years to come.',
    icon: '🖱️',
  },
  {
    href: '/services/recycling',
    title: 'Free Electronics Recycling',
    description: 'Drop off old computers, TVs, radios, consoles, and more. Data destruction guaranteed. No cost to you.',
    icon: '♻️',
  },
  {
    href: '/silver-plan',
    title: 'Protection Plans',
    description: 'Bronze, Silver, and Gold protection plans with antivirus, discounts on repairs, priority service, and peace of mind.',
    icon: '🛡️',
    silver: true,
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1597673030062-0a0f1a801a31?w=1920&q=80)' }}>
        <div className="container">
          <h2>Our Services</h2>
          <p>Comprehensive support for your computers and devices.</p>
        </div>
      </section>

      {/* Featured Section */}
      <section className="services texture-circuit">
        <div className="container">
          <h2>Featured</h2>
          <div className="cards">
            <Link href="/services/custom-computers" className="card card-link">
              <h3>🖥️ Custom-Built PCs</h3>
              <p>Your vision, expertly built. Gaming rigs, workstations, servers—we build it all with quality parts and clean cable management. Free lifetime diagnostics on every build.</p>
              <span className="card-action">Learn More →</span>
            </Link>
            <Link href="/why-linux" className="card card-link">
              <h3>🐧 Why Linux?</h3>
              <p>Windows 10 support ends October 2025. Your computer doesn&apos;t have to become obsolete. Linux runs faster, stays secure, and respects your privacy.</p>
              <span className="card-action">Discover Linux →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="benefits-section">
        <div className="container">
          <h2>All Services</h2>
          <p>Click any service to learn more about what we offer.</p>

          <div className="services-grid">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className={`service-card ${(service as { featured?: boolean }).featured ? 'featured' : ''} ${(service as { silver?: boolean }).silver ? 'silver' : ''}`}
              >
                <span className="service-icon">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="card-action">View Details →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not Sure Section */}
      <section className="cta" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="container">
          <h2>Not Sure What You Need?</h2>
          <p>Bring in your computer and we&apos;ll take a look. Our diagnostic fee rolls into the repair cost if you proceed—no pressure, just honest advice.</p>
          <Link href="/services/diagnostics" className="btn btn-white">Learn About Diagnostics</Link>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Contact us to discuss your needs or bring your computer in for service.</p>
          <Link href="/contact" className="btn btn-white">Get Your Free Quote</Link>
        </div>
      </section>
    </>
  );
}
