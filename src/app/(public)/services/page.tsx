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
      <section className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1597673030062-0a0f1a801a31?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Our Services</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Comprehensive support for your computers and devices.</p>
        </div>
      </section>

      {/* Featured Section */}
      <section className="texture-circuit hero-next-section -mt-20 pb-20 pt-32 relative z-[1] bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Featured</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <Link href="/services/custom-computers" className="no-underline text-inherit block">
              <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100 cursor-pointer">
                <h3>🖥️ Custom-Built PCs</h3>
                <p>Your vision, expertly built. Gaming rigs, workstations, servers—we build it all with quality parts and clean cable management. Free lifetime diagnostics on every build.</p>
                <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1 mt-auto">Learn More →</span>
              </div>
            </Link>
            <Link href="/why-linux" className="no-underline text-inherit block">
              <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100 cursor-pointer">
                <h3>🐧 Why Linux?</h3>
                <p>Windows 10 support ends October 2025. Your computer doesn&apos;t have to become obsolete. Linux runs faster, stays secure, and respects your privacy.</p>
                <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1 mt-auto">Discover Linux →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">All Services</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">Click any service to learn more about what we offer.</p>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 mt-8">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className={`service-card-bar flex flex-col bg-white rounded-brand-lg p-7 shadow-brand-md transition-all duration-normal no-underline text-inherit border-2 border-transparent relative overflow-hidden hover:-translate-y-1 hover:shadow-brand-lg hover:border-primary-300 ${(service as { featured?: boolean }).featured ? 'featured border-primary-600 bg-[linear-gradient(135deg,white_0%,rgba(37,99,235,0.03)_100%)]' : ''} ${(service as { silver?: boolean }).silver ? 'service-card-silver' : ''}`}
              >
                <span className="text-[2.5rem] mb-4 block">{service.icon}</span>
                <h3 className="text-[1.25rem] text-gray-900 mb-3 leading-tight">{service.title}</h3>
                <p className="text-[0.95rem] text-gray-600 leading-relaxed mb-4 flex-1">{service.description}</p>
                <span className="text-primary-600 font-semibold text-sm inline-flex items-center gap-1 mt-auto transition-all duration-fast hover:gap-2">View Details →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not Sure Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Not Sure What You Need?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll take a look. Our diagnostic fee rolls into the repair cost if you proceed—no pressure, just honest advice.</p>
          <Link href="/services/diagnostics" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Learn About Diagnostics</Link>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Ready to Get Started?</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Contact us to discuss your needs or bring your computer in for service.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Get Your Free Quote</Link>
        </div>
      </section>
    </>
  );
}
