/**
 * ANTIVIRUS SERVICE PAGE - Describes antivirus and protection services.
 *
 * WHEN TO EDIT: When updating the description, pricing, or details for this service.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Antivirus & Scam Protection | Computer Store Kansas',
  description: 'Antivirus and scam protection services in Topeka, KS. We install, configure, and manage your security software so you never have to deal with technical support.',
  openGraph: {
    title: 'Antivirus & Scam Protection - Computer Store Kansas',
    description: 'Protection from viruses and scams. We handle the technical side so you don\'t have to.',
    url: 'https://computerstoreks.com/services/antivirus',
  },
};

export default function AntivirusPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-overlay hero-clip text-white pt-32 pb-48 text-center relative overflow-visible z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1920&q=80)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[3]">
          <h2>Antivirus &amp; Scam Protection</h2>
          <p className="text-[clamp(1.1rem,2vw,1.3rem)] mb-0 max-w-[700px] mx-auto opacity-95">Stay protected. We handle the technical side.</p>
        </div>
      </section>

      {/* Main Value Prop */}
      <section className="texture-circuit hero-next-section -mt-20 pb-20 pt-32 relative z-[1] bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Protection Without the Hassle</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Security software is essential—but dealing with it can be frustrating. Installation issues,
            confusing settings, subscription renewals, technical support calls... We take care of all of it.
            You get the protection; we handle everything else.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>We Install &amp; Configure</h3>
              <p>No fumbling with downloads or confusing setup wizards. We install your security software and configure it properly from the start.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>We Handle Support</h3>
              <p>Problem with your antivirus? Don&apos;t spend hours on hold with tech support. Bring it to us and we&apos;ll deal with it for you.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>We Manage Renewals</h3>
              <p>Call us within 30 days of your subscription expiring and we&apos;ll handle the renewal over the phone. No hassle, no lapsed protection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Antivirus Section */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Antivirus Protection</h2>
          <p className="text-center text-gray-500 text-[1.1rem] mb-16 max-w-[700px] mx-auto">We recommend and install ESET antivirus—trusted, effective, and lightweight.</p>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600">
            <h3 className="text-primary-800 mb-4">Why ESET?</h3>
            <p className="text-gray-600 mb-0">ESET is known for excellent malware detection without slowing down your computer. It runs quietly in the background, protecting you without getting in your way. Unlike some antivirus programs that constantly nag you with pop-ups, ESET just works.</p>
          </div>

          <div className="mt-8" style={{ marginTop: '2rem' }}>
            <h3>What&apos;s Included:</h3>
            <ul className="list-none p-0 m-0">
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">ESET antivirus software (yearly subscription)</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Professional installation and configuration</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Settings optimized for your needs</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Quick tutorial on what you need to know</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Phone renewal support (within 30 days of expiration)</li>
              <li className="py-3 pl-8 relative text-[1.05rem] border-b border-bg-dark last:border-b-0 feature-list-check">Ongoing technical support—bring it in if you have issues</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Scam Protection Section */}
      <section className="texture-dots py-20 bg-bg-light">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-12">Scam Protection</h2>
          <p className="text-center" style={{ maxWidth: '700px', margin: '0 auto 3rem' }}>
            Antivirus catches viruses—but scammers use different tactics. They trick you into giving them
            access or clicking dangerous links. That&apos;s where dedicated scam protection comes in.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-12 mt-12">
            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">1</div>
              <div>
                <h4>Remote Access Blocking</h4>
                <p>Blocks the remote access tools scammers use to take control of your computer. These aren&apos;t viruses, so antivirus won&apos;t catch them—but scam protection will.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">2</div>
              <div>
                <h4>Scam Website Detection</h4>
                <p>Blocks known scam websites and alerts you to newly-created sites. Scammers constantly create new fake websites to avoid detection.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">3</div>
              <div>
                <h4>Fake Pop-up Detection</h4>
                <p>Detects those scary &quot;Your computer is infected!&quot; pop-ups that scammers use to trick you into calling fake support numbers.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">4</div>
              <div>
                <h4>Phishing Protection</h4>
                <p>Detects and blocks malicious links from emails and ads before you accidentally click something dangerous.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">5</div>
              <div>
                <h4>Typo Protection</h4>
                <p>Warns you if you accidentally mistype a popular website address. Scammers buy lookalike domains to catch these mistakes.</p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-brand-lg transition-all duration-normal hover:bg-bg-light hover:translate-x-2">
              <div className="shrink-0 w-[60px] h-[60px] flex items-center justify-center text-2xl font-extrabold text-primary-600 bg-primary-100 rounded-brand-md">6</div>
              <div>
                <h4>Guardian Alerts</h4>
                <p>Assign a trusted family member to receive alerts when a potential scam is detected—perfect for keeping an eye on loved ones.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-8 bg-primary-100 rounded-brand-lg border-l-4 border-primary-600" style={{ marginTop: '3rem' }}>
            <h3 className="text-primary-800 mb-4">One-Time Installation</h3>
            <p className="text-gray-600 mb-0">Unlike antivirus subscriptions, scam protection is a one-time install. Pay once and you&apos;re protected—no yearly renewals to worry about.</p>
          </div>
        </div>
      </section>

      {/* Why Both */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)' }}>
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Why You Need Both</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Antivirus and scam protection work differently. Antivirus catches malicious software trying to infect your computer. Scam protection catches the social engineering tricks that bypass antivirus entirely—fake tech support, phishing emails, fraudulent websites. Together, they cover the full range of threats you face online.</p>
        </div>
      </section>

      {/* Who Needs This */}
      <section className="py-20 bg-white">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4">
          <h2 className="text-center mb-4">Who Benefits Most?</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Everyone Online</h3>
              <p>If you use the internet, you need protection. Threats don&apos;t discriminate—everyone from tech experts to casual users can encounter malware and scams.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Online Shoppers &amp; Bankers</h3>
              <p>If you shop or bank online, your financial information is at risk. Proper protection keeps your accounts and identity safe.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Seniors &amp; Less Tech-Savvy Users</h3>
              <p>Scammers specifically target people who may be less familiar with their tactics. The guardian alert feature lets family members help keep loved ones safe.</p>
            </div>

            <div className="bg-white rounded-brand-lg p-8 shadow-brand-sm border border-bg-dark transition-all duration-normal hover:-translate-y-2 hover:shadow-brand-lg hover:border-primary-100">
              <h3>Anyone Tired of Dealing With It</h3>
              <p>If you just want protection that works without having to think about it, that&apos;s what we provide. We handle the technical side so you can focus on using your computer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-overlay bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 text-center relative overflow-hidden">
        <div className="w-[90%] max-w-[1200px] mx-auto px-4 relative z-[1]">
          <h2 className="text-white text-[2rem] mb-4">Get Protected</h2>
          <p className="text-[1.1rem] mb-8 opacity-95">Bring in your computer and we&apos;ll set you up with the protection you need. Installation, configuration, and support—all handled.</p>
          <Link href="/contact" className="inline-block px-8 py-[0.8rem] rounded-brand-md no-underline font-semibold text-base transition-all duration-normal cursor-pointer border-none text-center whitespace-nowrap bg-white text-primary-600 shadow-brand-md hover:-translate-y-0.5 hover:shadow-brand-lg">Protect My Computer</Link>
        </div>
      </section>
    </>
  );
}
