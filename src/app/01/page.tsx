/**
 * DESIGN CONCEPT 01 - Editorial / Magazine
 *
 * Standalone redesign concept for Computer Store Kansas. Sits outside the
 * (public) route group so it bypasses the live site Header/Footer and
 * renders as a full-bleed concept page at /01.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concept 01 / Editorial Magazine',
  description: 'Redesign concept: a confident, typography-led editorial direction for Computer Store Kansas.',
  robots: { index: false, follow: false },
};

export default function Concept01EditorialPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .c01-root{background:#fafaf7;color:#0a0a0a;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.65}
          .c01-root *{box-sizing:border-box}
          .c01-serif{font-family:'Instrument Serif',Georgia,serif;font-weight:400;letter-spacing:-.01em}
          .c01-italic{font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400}
          .c01-num{font-feature-settings:"tnum","ss01";font-variant-numeric:tabular-nums}
          .c01-hair{height:1px;background:rgba(10,10,10,.15)}
          .c01-smcaps{text-transform:uppercase;letter-spacing:.18em;font-weight:600;font-size:11px}
          .c01-smcaps-lg{text-transform:uppercase;letter-spacing:.22em;font-weight:600;font-size:12px}
          .c01-underline-blue{box-shadow:inset 0 -.35em 0 #dbeafe}
          .c01-photo{background-size:cover;background-position:center;background-color:#e7e5e0}
          .c01-ph-hero{background-image:url('/assets/CSK1.jpg')}
          .c01-ph-bench{background-image:url('/assets/CSK2.jpg')}
          .c01-ph-pc{background-image:url('/assets/gaming-pc-hero.png')}
          .c01-ph-laptop{background-image:url('/assets/laptop-hero.png')}
          .c01-ph-biz{background-image:url('/assets/business-pc-hero.png')}
          .c01-a-link{display:inline-flex;align-items:baseline;gap:.45rem;border-bottom:1px solid currentColor;padding-bottom:2px}
          .c01-a-link:hover{color:#1d4ed8}
          .c01-dropcap::first-letter{font-family:'Instrument Serif',serif;font-size:5.5em;line-height:.82;float:left;padding:.08em .15em 0 0;color:#1d4ed8}
          .c01-wrap{max-width:1280px;margin:0 auto;padding-left:24px;padding-right:24px}
          .c01-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px}
          @media (min-width:768px){.c01-grid{gap:40px}}
          .c01-h1{font-family:'Instrument Serif',Georgia,serif;font-size:88px;line-height:.92;letter-spacing:-.02em}
          @media (min-width:768px){.c01-h1{font-size:128px}}
          .c01-h2{font-family:'Instrument Serif',Georgia,serif;font-size:56px;line-height:.95;letter-spacing:-.02em}
          @media (min-width:768px){.c01-h2{font-size:88px}}
          .c01-h2-md{font-family:'Instrument Serif',Georgia,serif;font-size:52px;line-height:.95;letter-spacing:-.02em}
          @media (min-width:768px){.c01-h2-md{font-size:80px}}
          .c01-h2-cta{font-family:'Instrument Serif',Georgia,serif;font-size:64px;line-height:.92;letter-spacing:-.025em}
          @media (min-width:768px){.c01-h2-cta{font-size:112px}}
          .c01-btn-dark{display:inline-flex;align-items:center;gap:.75rem;background:#0a0a0a;color:#fff;padding:14px 24px;font-size:14px;font-weight:500;text-decoration:none;transition:background .2s ease}
          .c01-btn-dark:hover{background:#1d4ed8}
          .c01-btn-outline{display:inline-flex;align-items:center;gap:.75rem;border:1px solid #0a0a0a;color:#0a0a0a;padding:14px 24px;font-size:14px;font-weight:500;text-decoration:none;transition:all .2s ease}
          .c01-btn-outline:hover{background:#0a0a0a;color:#fff}
          .c01-svc-row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));align-items:baseline;gap:16px;padding:24px 0;border-bottom:1px solid rgba(0,0,0,.15);transition:background .2s ease}
          .c01-svc-row:hover{background:#fff}
          .c01-svc-row:last-child{border-bottom:none}
          .c01-svc-title{font-family:'Instrument Serif',Georgia,serif;font-size:34px;line-height:1}
          @media (min-width:768px){.c01-svc-title{font-size:44px}}
          .c01-stat-num{font-family:'Instrument Serif',Georgia,serif;font-size:40px;line-height:1}
          .c01-pull-quote{font-family:'Instrument Serif',Georgia,serif;font-size:44px;line-height:1;letter-spacing:-.02em}
          @media (min-width:768px){.c01-pull-quote{font-size:60px}}
          .c01-meta-bar{position:sticky;top:0;z-index:50;background:#0a0a0a;color:#fff;font-size:12.5px}
        `,
        }}
      />

      <main className="c01-root">
        {/* Concept header bar */}
        <aside className="c01-meta-bar">
          <div className="c01-wrap" style={{ paddingTop: 10, paddingBottom: 10 }}>
            <div className="c01-grid" style={{ alignItems: 'start' }}>
              <div style={{ gridColumn: 'span 12 / span 12', display: 'flex', alignItems: 'center', gap: 12 }} className="md:!col-span-3">
                <span className="c01-smcaps" style={{ color: '#3b82f6' }}>Concept 01</span>
                <span className="c01-serif" style={{ fontSize: 22, lineHeight: 1 }}>Editorial</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Top nav */}
        <header style={{ borderBottom: '1px solid rgba(0,0,0,.1)' }}>
          <div className="c01-wrap" style={{ paddingTop: 20, paddingBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 36, width: 'auto' }} />
            </a>
            <nav style={{ display: 'none', gap: 36, fontSize: 14 }} className="md:!flex">
              <a href="#services" style={{ color: '#0a0a0a', textDecoration: 'none' }}>Services</a>
              <a href="#shop" style={{ color: '#0a0a0a', textDecoration: 'none' }}>Computers</a>
              <a href="#why" style={{ color: '#0a0a0a', textDecoration: 'none' }}>About</a>
              <a href="#visit" style={{ color: '#0a0a0a', textDecoration: 'none' }}>Visit</a>
            </nav>
            <a href="tel:7852673223" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: '#0a0a0a', textDecoration: 'none' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Open today (785) 267-3223
            </a>
          </div>
        </header>

        {/* HERO */}
        <section style={{ borderBottom: '1px solid rgba(0,0,0,.1)' }}>
          <div className="c01-wrap" style={{ paddingTop: 56, paddingBottom: 96 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 56, flexWrap: 'wrap', gap: 12 }}>
              <div className="c01-smcaps-lg">Vol. 22 . Topeka, Kansas . Established 2003</div>
              <div className="c01-smcaps-lg" style={{ display: 'none' }}>Issue No. 048</div>
            </div>

            <div className="c01-grid">
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 24 }}>Your go-to technology center since 2003</div>
                <h1 className="c01-h1">
                  Your computer<br />
                  <span className="c01-italic">is not</span> a<br />
                  mystery.<span style={{ color: '#1d4ed8' }}>_</span>
                </h1>
                <p className="c01-dropcap" style={{ marginTop: 40, maxWidth: '46ch', fontSize: 17, color: 'rgba(10,10,10,.8)', lineHeight: 1.55 }}>
                  For more than twenty years we have repaired, rebuilt, and refused to throw away
                  the machines that the rest of Topeka was told to replace. We open the case.
                  We write down what we find. We tell you honestly what is wrong, then we fix it.
                  The diagnostic fee rolls into the repair cost, so an honest answer never costs extra.
                </p>
                <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
                  <a href="#visit" className="c01-btn-dark">
                    Schedule a service call <span>&rarr;</span>
                  </a>
                  <a href="#services" className="c01-a-link" style={{ fontSize: 14, fontWeight: 500, color: '#0a0a0a', textDecoration: 'none' }}>See what we work on</a>
                </div>
                <p style={{ marginTop: 28, fontSize: 14, color: 'rgba(10,10,10,.55)', fontStyle: 'italic' }} className="c01-italic">Now booking house calls across Topeka and the surrounding area.</p>
              </div>
            </div>

            <div className="c01-grid" style={{ marginTop: 56 }}>
              <aside style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-photo c01-ph-hero" style={{ width: '100%', aspectRatio: '16 / 9' }}></div>
                <p style={{ marginTop: 12, fontSize: 12.5, color: '#737373' }} className="c01-italic">Fig. 01. The bench at 2008 SW Gage Blvd, on an average Wednesday afternoon.</p>

                <div className="c01-hair" style={{ margin: '28px 0' }}></div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', columnGap: 24, rowGap: 20 }}>
                  <div>
                    <div className="c01-stat-num c01-num">22</div>
                    <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>Years serving Topeka</div>
                  </div>
                  <div>
                    <div className="c01-stat-num c01-num">2003</div>
                    <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>Locally owned since</div>
                  </div>
                  <div>
                    <div className="c01-stat-num c01-num">1,000<span style={{ color: '#737373', fontSize: 20, verticalAlign: 'top' }}>+</span></div>
                    <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>Satisfied customers</div>
                  </div>
                  <div>
                    <div className="c01-stat-num c01-num">$0</div>
                    <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>For your upfront quote</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* SERVICES TABLE OF CONTENTS */}
        <section id="services" style={{ borderBottom: '1px solid rgba(0,0,0,.1)', background: '#fafaf7' }}>
          <div className="c01-wrap" style={{ paddingTop: 96, paddingBottom: 112 }}>
            <div className="c01-grid" style={{ alignItems: 'end', marginBottom: 56 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 16 }}>Section 01. Services</div>
                <h2 className="c01-h2">
                  What we work on,<br /><span className="c01-italic">every weekday.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', fontSize: 15, color: 'rgba(10,10,10,.8)', marginTop: 24 }}>
                Every job opens with a written diagnostic. The fee rolls into your repair if you decide
                to proceed. No commissions, no upselling, and a clear estimate before we touch the machine.
              </div>
            </div>

            <ol style={{ borderTop: '1px solid rgba(0,0,0,.8)', padding: 0, listStyle: 'none', margin: 0 }}>
              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num" >01</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}>
                  <span className="c01-svc-title c01-underline-blue">Diagnostics</span>
                </div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>
                  Thorough troubleshooting. Fee rolls into the repair cost.
                </div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">02</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">Virus and malware removal</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>Triage, cleanup, browser reset, and 20 minutes of training so it does not happen again.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">03</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title c01-italic">Data transfer and recovery</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>Drive cloning, file migration, accidental deletes, and dropped storage devices.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">04</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">OS installation</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>Fresh Windows or Linux. Dual-boot setups welcome. Windows license included.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">05</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">Hardware upgrades</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>RAM, SSD, graphics card, processor. Old machines made new again.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">06</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">Custom built PCs</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>Gaming, workstation, home office, server. Free lifetime diagnostics on every build.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">07</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">Laptops and refurbished desktops</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>New Asus and Lenovo laptops, plus quality refurbished options. Custom orders welcome.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">08</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title">Printers</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>New Brother printers, plus repair service. In-home setup available with purchase.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>

              <li className="c01-svc-row">
                <div style={{ gridColumn: 'span 1 / span 1' }} className="c01-num">09</div>
                <div style={{ gridColumn: 'span 5 / span 5' }}><span className="c01-svc-title c01-italic">Free electronics recycling</span></div>
                <div style={{ gridColumn: 'span 4 / span 4', color: '#737373', fontSize: 13.5 }}>Drop off old computers, TVs, radios, consoles. Data destruction included.</div>
                <div style={{ gridColumn: 'span 2 / span 2', fontSize: 13, color: '#737373', textAlign: 'right' }}>view &rarr;</div>
              </li>
            </ol>
          </div>
        </section>

        {/* IN STORE PCs */}
        <section id="shop" style={{ borderBottom: '1px solid rgba(0,0,0,.1)' }}>
          <div className="c01-wrap" style={{ paddingTop: 96, paddingBottom: 112 }}>
            <div className="c01-grid" style={{ marginBottom: 56 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }} className="md:!col-span-6">
                <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 16 }}>Section 02. From the floor</div>
                <h2 className="c01-h2-md">
                  Computers built<br />
                  on the bench <span className="c01-italic">in Topeka.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', alignSelf: 'end', fontSize: 15, color: 'rgba(10,10,10,.8)' }}>
                Every desktop on our wall was specified, built, and tested by the same people who will hand it
                to you. Try the keyboards. Hear the fans. Ask any question.
                <a href="/computers" className="c01-a-link" style={{ marginTop: 12, display: 'inline-flex', color: '#1d4ed8', textDecoration: 'none' }}>Browse the full lineup &rarr;</a>
              </div>
            </div>

            <div className="c01-grid">
              <article style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-photo c01-ph-pc" style={{ width: '100%', aspectRatio: '4 / 3' }}></div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 4 }}>Featured build</div>
                    <h3 className="c01-serif" style={{ fontSize: 40, lineHeight: 1 }}>Custom gaming PC <span className="c01-italic">. built to spec</span></h3>
                    <p style={{ marginTop: 12, fontSize: 14.5, color: '#737373', maxWidth: '52ch' }}>
                      Specced in a thirty minute session with one of our techs. Parts at fair pricing, clean
                      cable management, stress tested before pickup, free lifetime diagnostics for as long as you own it.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="c01-smcaps" style={{ color: '#737373' }}>Quoted to your build</div>
                    <div className="c01-num" style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, lineHeight: 1, marginTop: 8 }}>contact for quote</div>
                  </div>
                </div>
              </article>
            </div>

            <div className="c01-grid" style={{ marginTop: 48 }}>
              <article style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-photo c01-ph-laptop" style={{ width: '100%', aspectRatio: '16 / 10' }}></div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                  <div>
                    <h3 className="c01-serif" style={{ fontSize: 28, lineHeight: 1 }}>New laptops</h3>
                    <p style={{ fontSize: 13, color: '#737373', marginTop: 6 }}>Asus and Lenovo. Configured, debloated, ready to use.</p>
                  </div>
                  <div className="c01-serif c01-num" style={{ fontSize: 22 }}>in stock</div>
                </div>
              </article>

              <article style={{ gridColumn: 'span 12 / span 12', marginTop: 32 }}>
                <div className="c01-photo c01-ph-biz" style={{ width: '100%', aspectRatio: '16 / 10' }}></div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                  <div>
                    <h3 className="c01-serif" style={{ fontSize: 28, lineHeight: 1 }}>Business and refurbished desktops</h3>
                    <p style={{ fontSize: 13, color: '#737373', marginTop: 6 }}>Cleaned, tested, ready to work for years to come.</p>
                  </div>
                  <div className="c01-serif c01-num" style={{ fontSize: 22 }}>in stock</div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section id="why" style={{ borderBottom: '1px solid rgba(0,0,0,.1)', background: '#f0f2f5' }}>
          <div className="c01-wrap" style={{ paddingTop: 96, paddingBottom: 112 }}>
            <div className="c01-grid">
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 24 }}>Section 03. From the owner</div>
                <blockquote className="c01-pull-quote" style={{ margin: 0 }}>
                  <span className="c01-italic" style={{ color: '#1d4ed8' }}>&ldquo;</span>Every computer that comes through our doors has a story. Family photos. A small business.
                  <span className="c01-italic"> A student&rsquo;s future.</span> We treat each one like it matters, because it does.<span className="c01-italic" style={{ color: '#1d4ed8' }}>&rdquo;</span>
                </blockquote>
                <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontWeight: 600 }}>MB</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Max Beyer</div>
                    <div style={{ fontSize: 12.5, color: '#737373' }}>Owner, Computer Store Kansas</div>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 12 / span 12', marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 32, rowGap: 40 }}>
                <div>
                  <div className="c01-serif" style={{ fontSize: 44, lineHeight: 1 }}>Expertise<br /><span className="c01-italic">and experience.</span></div>
                  <p style={{ fontSize: 14, color: 'rgba(10,10,10,.8)', marginTop: 12, lineHeight: 1.6 }}>Over 20 years diagnosing and fixing every kind of computer issue. We keep learning every week.</p>
                </div>
                <div>
                  <div className="c01-serif" style={{ fontSize: 44, lineHeight: 1 }}>Honest,<br /><span className="c01-italic">transparent pricing.</span></div>
                  <p style={{ fontSize: 14, color: 'rgba(10,10,10,.8)', marginTop: 12, lineHeight: 1.6 }}>Clear estimates upfront. No surprises at the counter. Non-commissioned techs, ever.</p>
                </div>
                <div>
                  <div className="c01-serif" style={{ fontSize: 44, lineHeight: 1 }}>We protect<br /><span className="c01-italic">your data.</span></div>
                  <p style={{ fontSize: 14, color: 'rgba(10,10,10,.8)', marginTop: 12, lineHeight: 1.6 }}>Our first priority is to back up and protect your files before anything else happens on the bench.</p>
                </div>
                <div>
                  <div className="c01-serif" style={{ fontSize: 44, lineHeight: 1 }}>Local<br /><span className="c01-italic">and personal.</span></div>
                  <p style={{ fontSize: 14, color: 'rgba(10,10,10,.8)', marginTop: 12, lineHeight: 1.6 }}>You are not a ticket number. We are your neighbors on Gage Blvd, and we will be here tomorrow.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="visit" style={{ background: '#fff' }}>
          <div className="c01-wrap" style={{ paddingTop: 144, paddingBottom: 144 }}>
            <div className="c01-grid" style={{ alignItems: 'end' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-smcaps" style={{ color: '#1d4ed8', marginBottom: 24 }}>Section 04. Visit</div>
                <h2 className="c01-h2-cta">
                  Bring it in.<br />
                  <span className="c01-italic" style={{ color: '#1d4ed8' }}>We will take a look.</span>
                </h2>
                <p style={{ marginTop: 32, fontSize: 17, maxWidth: '44ch', color: 'rgba(10,10,10,.8)' }}>
                  Walk-ins welcome Monday through Saturday. Drop your machine at the counter and we will get started.
                  Or have one of our techs come to you. Now booking house calls across Topeka.
                </p>
                <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <a href="/contact" className="c01-btn-dark">Schedule a service call <span>&rarr;</span></a>
                  <a href="tel:7852673223" className="c01-btn-outline">Call (785) 267-3223</a>
                </div>
              </div>
              <aside style={{ gridColumn: 'span 12 / span 12', fontSize: 14, lineHeight: 1.75, marginTop: 56 }}>
                <div className="c01-hair" style={{ marginBottom: 20 }}></div>
                <div className="c01-smcaps" style={{ color: '#737373', marginBottom: 12 }}>The shop</div>
                <p style={{ margin: 0 }}>2008 SW Gage Blvd<br />Topeka, KS 66604</p>
                <div className="c01-smcaps" style={{ color: '#737373', marginTop: 24, marginBottom: 12 }}>Hours</div>
                <p style={{ margin: 0 }}>Mon to Fri . 10 am to 6 pm<br />Sat . 10 am to 2 pm<br />Sun . closed</p>
                <div className="c01-smcaps" style={{ color: '#737373', marginTop: 24, marginBottom: 12 }}>House calls</div>
                <p style={{ margin: 0 }}>Now booking on-site visits across Topeka and the surrounding area. Call (785) 267-3223 to arrange.</p>
              </aside>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#0a0a0a', color: '#fff' }}>
          <div className="c01-wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="c01-grid" style={{ fontSize: 13.5 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c01-serif" style={{ fontSize: 34, lineHeight: 1 }}>Computer Store <span className="c01-italic">Kansas</span></div>
                <p style={{ color: 'rgba(255,255,255,.6)', marginTop: 16, maxWidth: 384 }}>An independent computer sales and repair shop in Topeka, Kansas. Locally owned since 2003.</p>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div className="c01-smcaps" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Services</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', rowGap: 8, color: 'rgba(255,255,255,.85)' }}>
                  <li>Diagnostics</li><li>Virus removal</li><li>Hardware upgrades</li><li>Custom builds</li><li>Recycling</li>
                </ul>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div className="c01-smcaps" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Shop</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', rowGap: 8, color: 'rgba(255,255,255,.85)' }}>
                  <li>New laptops</li><li>Custom PCs</li><li>Refurbished desktops</li><li>Printers</li><li>Protection plans</li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div className="c01-wrap" style={{ paddingTop: 20, paddingBottom: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
              <div>(c) 2026 Computer Store Kansas . 2008 SW Gage Blvd, Topeka KS 66604</div>
              <div>Set in Instrument Serif and Inter</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
