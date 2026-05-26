/**
 * DESIGN CONCEPT 03 - Soft & Warm Local Business
 *
 * Standalone redesign concept for Computer Store Kansas. Humanized,
 * neighborhood-feel direction with rounded shapes, warm cream background,
 * and lighter blue tones. Available at /03.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concept 03 / Soft & Warm Local',
  description: 'Redesign concept: a warm, neighborhood-feel direction for Computer Store Kansas.',
  robots: { index: false, follow: false },
};

export default function Concept03SoftWarmPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .c03-root{background:#fbfaf6;color:#1c1d21;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.6}
          .c03-root *{box-sizing:border-box}
          .c03-display{font-family:'Bricolage Grotesque','Inter',sans-serif;font-variation-settings:"opsz" 80;letter-spacing:-.03em;line-height:.97}
          .c03-hand{font-family:'Caveat',cursive;font-weight:600}
          .c03-num{font-variant-numeric:tabular-nums}
          .c03-blob-1{border-radius:64% 36% 58% 42% / 52% 60% 40% 48%}
          .c03-blob-2{border-radius:42% 58% 38% 62% / 60% 44% 56% 40%}
          .c03-blob-3{border-radius:50% 50% 60% 40% / 55% 45% 55% 45%}
          .c03-photo{background-size:cover;background-position:center;background-color:#e9e3d8}
          .c03-ph-shop{background-image:url('/assets/CSK1.jpg')}
          .c03-ph-bench{background-image:url('/assets/CSK2.jpg')}
          .c03-ph-int{background-image:url('/assets/CSK3.jpg')}
          .c03-ph-pc{background-image:url('/assets/gaming-pc-hero.png')}
          .c03-ph-laptop{background-image:url('/assets/laptop-hero.png')}
          .c03-ph-biz{background-image:url('/assets/business-pc-hero.png')}
          .c03-ph-img1{background-image:url('/assets/IMG_0569.jpg')}
          .c03-ph-img2{background-image:url('/assets/IMG_0573.jpg')}
          .c03-pencil{background-image:linear-gradient(transparent 80%, #dbeafe 80%, #dbeafe 100%);padding:0 .15em}
          .c03-btn{display:inline-flex;align-items:center;gap:.6rem;border-radius:9999px;padding:.95rem 1.6rem;font-weight:600;font-size:15px;transition:transform .15s ease, background .2s ease;text-decoration:none}
          .c03-btn:hover{transform:translateY(-1px)}
          .c03-btn-blue{background:#2563eb;color:#fff}
          .c03-btn-blue:hover{background:#1d4ed8}
          .c03-btn-white{background:#fff;color:#0a0a0a;box-shadow:inset 0 0 0 1px rgba(10,10,10,.1)}
          .c03-btn-white:hover{box-shadow:inset 0 0 0 1px rgba(10,10,10,.3)}
          .c03-sticky{background:#fff7d6;border-radius:6px;box-shadow:0 6px 18px -8px rgba(0,0,0,.15), 0 1px 0 rgba(0,0,0,.04);transform:rotate(-2.2deg);font-family:'Caveat',cursive;font-weight:600}
          .c03-card{background:#fff;border-radius:24px;padding:28px;box-shadow:inset 0 0 0 1px rgba(37,99,235,.18);transition:transform .25s ease, box-shadow .25s ease}
          .c03-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.08), inset 0 0 0 1px rgba(37,99,235,.3)}
          .c03-wrap{max-width:1280px;margin:0 auto;padding-left:24px;padding-right:24px}
          .c03-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:32px}
          .c03-h1{font-family:'Bricolage Grotesque','Inter',sans-serif;font-variation-settings:"opsz" 80;letter-spacing:-.03em;line-height:.97;font-size:68px}
          @media (min-width:768px){.c03-h1{font-size:104px}}
          .c03-h2{font-family:'Bricolage Grotesque','Inter',sans-serif;font-variation-settings:"opsz" 80;letter-spacing:-.03em;line-height:.97;font-size:44px}
          @media (min-width:768px){.c03-h2{font-size:64px}}
        `,
        }}
      />

      <main className="c03-root">
        {/* Concept header bar */}
        <aside style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0a0a0a', color: '#fff', fontSize: 12.5 }}>
          <div className="c03-wrap" style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 600 }}>Concept 03</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>Soft &amp; Warm Local</span>
            <span className="c03-hand" style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, marginLeft: 8 }}>your neighbor who happens to fix computers</span>
          </div>
        </aside>

        {/* NAV */}
        <header style={{ position: 'relative' }}>
          <div className="c03-wrap" style={{ paddingTop: 24, paddingBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 40, width: 'auto' }} />
            </a>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 15, fontWeight: 500 }}>
              <a href="#services" style={{ color: '#1c1d21', textDecoration: 'none' }}>Services</a>
              <a href="#shop" style={{ color: '#1c1d21', textDecoration: 'none' }}>Computers</a>
              <a href="#meet" style={{ color: '#1c1d21', textDecoration: 'none' }}>About us</a>
              <a href="#visit" style={{ color: '#1c1d21', textDecoration: 'none' }}>Visit</a>
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#059669', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Open today
              </span>
              <a href="tel:7852673223" className="c03-btn c03-btn-blue">Say hi . (785) 267-3223</a>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
            <div className="c03-blob-1" style={{ position: 'absolute', top: -96, right: -128, width: 520, height: 520, background: '#eff6ff' }}></div>
            <div className="c03-blob-2" style={{ position: 'absolute', top: 288, left: -128, width: 360, height: 360, background: 'rgba(219,234,254,.6)' }}></div>
          </div>

          <div className="c03-wrap" style={{ position: 'relative', paddingTop: 32, paddingBottom: 96 }}>
            <div className="c03-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1d4ed8', borderRadius: 9999, padding: '6px 16px', fontSize: 13, fontWeight: 600, boxShadow: 'inset 0 0 0 1px #dbeafe' }}>
                  Howdy from Gage Boulevard
                </span>
                <h1 className="c03-h1" style={{ marginTop: 28, marginBottom: 0 }}>
                  The computer
                  <span className="c03-hand" style={{ color: '#2563eb', fontSize: 80, display: 'block', marginTop: -8, fontFamily: "'Caveat', cursive" }}>people</span>
                  your neighbors<br />
                  <span className="c03-pencil">already trust.</span>
                </h1>
                <p style={{ marginTop: 32, fontSize: 19, color: '#3a3b40', maxWidth: '52ch', lineHeight: 1.55 }}>
                  We are a small computer shop on SW Gage Blvd in Topeka. Twenty-two years of fixing the
                  machines that keep your family running. Honestly, kindly, and almost always faster than
                  you would expect.
                </p>
                <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                  <a href="/contact" className="c03-btn c03-btn-blue">Schedule a service call <span aria-hidden>&rarr;</span></a>
                  <a href="#meet" className="c03-btn c03-btn-white">Meet our shop</a>
                  <span className="c03-hand" style={{ fontSize: 18, color: '#1d4ed8' }}>house calls now booking</span>
                </div>

                <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 14, color: '#3a3b40' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 18 }}>[+]</span> Honest, transparent pricing</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 18 }}>[+]</span> Diagnostic fee rolls into repair</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 18 }}>[+]</span> Non-commissioned techs</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#059669', fontSize: 18 }}>[+]</span> Free electronics recycling</div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 12 / span 12', position: 'relative', marginTop: 48 }}>
                <div className="c03-photo c03-ph-shop c03-blob-1" style={{ width: '100%', aspectRatio: '5 / 6' }}></div>
                <div className="c03-photo c03-ph-bench c03-blob-3" style={{ position: 'absolute', bottom: -32, left: -24, width: 176, height: 176, boxShadow: '0 0 0 8px #fbfaf6' }}></div>
                <div className="c03-sticky" style={{ position: 'absolute', top: -8, left: -24, padding: '16px 20px', fontSize: 18, maxWidth: 200, lineHeight: 1.15 }}>
                  open till 6
                  <div style={{ fontSize: 12, fontFamily: 'Inter,sans-serif', fontWeight: 400, color: '#737373', marginTop: 4 }}>(walk-ins welcome)</div>
                </div>
                <div style={{ position: 'absolute', right: -8, top: 48, background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 10px 30px rgba(0,0,0,.1), inset 0 0 0 1px #dbeafe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="c03-display c03-num" style={{ fontSize: 34, lineHeight: 1, color: '#1d4ed8' }}>22</div>
                    <div style={{ fontSize: 13, lineHeight: 1.2 }}>
                      <div style={{ color: '#0a0a0a', fontWeight: 600 }}>years in business</div>
                      <div style={{ color: '#737373' }}>Locally owned since 2003</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" style={{ background: '#eff6ff' }}>
          <div className="c03-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div className="c03-grid" style={{ marginBottom: 48 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>things we fix</span>
                <h2 className="c03-h2" style={{ marginTop: 8, marginBottom: 0 }}>
                  Bring it in,<br />
                  <span style={{ color: '#1d4ed8' }}>we will figure it out together.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', alignSelf: 'end', fontSize: 16, color: '#3a3b40' }}>
                Not sure what is wrong? Just bring it in. Our diagnostic fee <span style={{ fontWeight: 600 }}>rolls into the repair cost</span> if you go ahead with the fix.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 20 }}>
              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>01</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Diagnostics</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>Thorough troubleshooting to identify issues quickly and accurately. The fee rolls into your repair cost.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Walk-in welcome</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>same week</span>
                </div>
              </article>

              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>02</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Virus cleanup</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>Pop-ups, ransom screens, weird emails. We clean it up and show you what to watch for next time.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Cleaned and protected</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>training included</span>
                </div>
              </article>

              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>03</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Data recovery</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>Files, settings, programs moved to a new computer. Drive cloning. Accidental deletes. Dropped phones.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Backup before work</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>your data first</span>
                </div>
              </article>

              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>04</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>OS installation</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>Fresh Windows or Linux. Dual-boot setups welcome. Old laptop too slow for Windows 11? Linux gives it years.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>License included</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>same week</span>
                </div>
              </article>

              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>05</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Custom builds</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>Tell us what it is for. A kid&rsquo;s first gaming rig, the Sims, AutoCAD, streaming. We spec it with you and build it here.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Free lifetime diag</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>your spec</span>
                </div>
              </article>

              <article className="c03-card">
                <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>06</div>
                <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Upgrades</h3>
                <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40' }}>SSD, RAM, GPU, CPU. An SSD can turn a slow computer into the fastest one in the house. We will tell you honestly if it is worth it.</p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Honest advice</span>
                  <span style={{ fontSize: 13, color: '#737373' }}>same week</span>
                </div>
              </article>

              <article className="c03-card" style={{ gridColumn: 'span 2 / span 2' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 20 }}>
                  <div className="c03-display" style={{ fontSize: 24, color: '#1d4ed8' }}>07</div>
                  <div style={{ flex: 1 }}>
                    <h3 className="c03-display" style={{ fontSize: 28, marginTop: 0, marginBottom: 0 }}>Recycling, printers, and protection plans</h3>
                    <p style={{ marginTop: 8, fontSize: 15, color: '#3a3b40', maxWidth: '60ch' }}>
                      Free electronics recycling with data destruction. New Brother printers with in-home setup. Bronze, Silver,
                      and Gold protection plans for ongoing peace of mind.
                    </p>
                  </div>
                  <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: 14, flexShrink: 0, alignSelf: 'end' }}>view details</span>
                </div>
              </article>

              <article className="c03-card" style={{ background: '#1d4ed8', color: '#fff', boxShadow: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="c03-hand" style={{ color: '#dbeafe', fontSize: 20 }}>do not see it?</span>
                  <h3 className="c03-display" style={{ fontSize: 28, marginTop: 8, marginBottom: 0 }}>Just ask.</h3>
                  <p style={{ marginTop: 8, fontSize: 15, color: 'rgba(255,255,255,.85)' }}>Phones, printers, projectors, that one cable. If it plugs in, we have probably worked on it.</p>
                </div>
                <a href="/contact" className="c03-btn" style={{ background: '#fff', color: '#1d4ed8', marginTop: 24, alignSelf: 'start' }}>Ask us anything &rarr;</a>
              </article>
            </div>
          </div>
        </section>

        {/* MEET THE SHOP */}
        <section id="meet" style={{ background: '#fbfaf6' }}>
          <div className="c03-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div className="c03-grid" style={{ marginBottom: 56 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>about us</span>
                <h2 className="c03-h2" style={{ marginTop: 8, marginBottom: 0 }}>
                  A real shop,<br />
                  <span style={{ color: '#1d4ed8' }}>with real people</span> in it.
                </h2>
                <p style={{ marginTop: 20, fontSize: 17, color: '#3a3b40', maxWidth: '58ch' }}>
                  When you call, a person picks up. When you walk in, a tech walks over. Every computer that comes through
                  our doors has a story. Family photos, a small business, a student&rsquo;s future. We treat each one like it matters,
                  because it does.
                </p>
                <p className="c03-hand" style={{ marginTop: 24, fontSize: 22, color: '#1d4ed8' }}>Max Beyer, owner</p>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', marginTop: 32 }}>
                <div style={{ position: 'relative', borderRadius: 24, background: '#eff6ff', aspectRatio: '5 / 3', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #dbeafe' }}>
                  <svg viewBox="0 0 500 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <path d="M -20 200 Q 100 180 250 210 T 520 220" stroke="#3b82f6" strokeWidth="14" fill="none" opacity=".25" strokeLinecap="round" />
                    <path d="M 220 -20 Q 230 90 250 160 T 280 320" stroke="#3b82f6" strokeWidth="14" fill="none" opacity=".25" strokeLinecap="round" />
                    <path d="M 60 60 Q 180 110 320 80 T 540 60" stroke="#3b82f6" strokeWidth="8" fill="none" opacity=".18" strokeLinecap="round" strokeDasharray="2 6" />
                    <circle cx="248" cy="200" r="10" fill="#2563eb" />
                    <circle cx="248" cy="200" r="22" fill="#2563eb" opacity=".18" />
                    <text x="265" y="195" fontFamily="Caveat" fontSize="22" fontWeight="700" fill="#1d4ed8">our shop (2008 SW Gage)</text>
                    <text x="40" y="50" fontFamily="Caveat" fontSize="18" fill="#737373">SW Gage Blvd</text>
                    <text x="290" y="50" fontFamily="Caveat" fontSize="18" fill="#737373">to West Ridge Mall</text>
                    <text x="90" y="270" fontFamily="Caveat" fontSize="18" fill="#737373">Washburn campus</text>
                    <text x="370" y="270" fontFamily="Caveat" fontSize="18" fill="#737373">SW 21st St</text>
                  </svg>
                </div>
                <p className="c03-hand" style={{ textAlign: 'center', color: '#737373', marginTop: 12, fontSize: 18 }}>just off SW 21st, near Washburn</p>
              </div>
            </div>

            {/* Five Reasons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
              <article className="c03-card">
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>01</div>
                  <div>
                    <h3 className="c03-display" style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>Expertise and experience</h3>
                    <p style={{ fontSize: 14, color: '#3a3b40', margin: 0 }}>Over 20 years diagnosing and fixing computers. We keep learning every week because the work keeps changing.</p>
                  </div>
                </div>
              </article>
              <article className="c03-card">
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>02</div>
                  <div>
                    <h3 className="c03-display" style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>Fast and reliable</h3>
                    <p style={{ fontSize: 14, color: '#3a3b40', margin: 0 }}>Quick response, efficient processes, and quality checks before your machine goes home.</p>
                  </div>
                </div>
              </article>
              <article className="c03-card">
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>03</div>
                  <div>
                    <h3 className="c03-display" style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>Honest, transparent pricing</h3>
                    <p style={{ fontSize: 14, color: '#3a3b40', margin: 0 }}>Clear estimates upfront. No surprises at the counter. Non-commissioned techs, every time.</p>
                  </div>
                </div>
              </article>
              <article className="c03-card">
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>04</div>
                  <div>
                    <h3 className="c03-display" style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>We protect your data</h3>
                    <p style={{ fontSize: 14, color: '#3a3b40', margin: 0 }}>Our first priority is backing up and protecting your files in case anything happens on the bench.</p>
                  </div>
                </div>
              </article>
              <article className="c03-card" style={{ gridColumn: 'span 2 / span 2', background: 'rgba(219,234,254,.5)' }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 16, background: '#dbeafe', color: '#1d4ed8', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>05</div>
                  <div style={{ flex: 1 }}>
                    <h3 className="c03-display" style={{ fontSize: 22, marginTop: 0, marginBottom: 8 }}>Local &amp; personal</h3>
                    <p style={{ fontSize: 14, color: '#3a3b40', margin: 0 }}>You are not a ticket number. We treat every customer like family because as a locally owned business, you are part of our community.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* IN-STORE PCS */}
        <section id="shop" style={{ background: '#fff' }}>
          <div className="c03-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div className="c03-grid" style={{ marginBottom: 48, alignItems: 'end' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>our showroom</span>
                <h2 className="c03-h2" style={{ marginTop: 8, marginBottom: 0 }}>
                  Computers we sell,<br />
                  <span style={{ color: '#1d4ed8' }}>and build, in Topeka.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', fontSize: 16, color: '#3a3b40' }}>
                Try them out before you buy. Keyboards, screens, even sound. <a href="/computers" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 4 }}>Browse the full lineup &rarr;</a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 24 }}>
              <article style={{ borderRadius: 24, background: '#eff6ff', overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease' }}>
                <div className="c03-photo c03-ph-pc" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <span style={{ background: 'rgba(16,185,129,.15)', color: '#059669', borderRadius: 9999, padding: '4px 10px' }}>Custom build</span>
                    <span style={{ color: '#737373' }}>Built in shop</span>
                  </div>
                  <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Custom gaming PC</h3>
                  <p style={{ fontSize: 14.5, color: '#3a3b40', marginTop: 6 }}>Spec\'d with one of our techs. Clean cable management, stress-tested, lifetime diagnostics.</p>
                  <div style={{ marginTop: 20, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div>
                      <div className="c03-display c03-num" style={{ fontSize: 30, lineHeight: 1 }}>quote</div>
                      <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>tailored to your build</div>
                    </div>
                    <a href="/contact" className="c03-btn c03-btn-blue" style={{ fontSize: 14, padding: '10px 16px' }}>Get a quote &rarr;</a>
                  </div>
                </div>
              </article>

              <article style={{ borderRadius: 24, background: '#eff6ff', overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease' }}>
                <div className="c03-photo c03-ph-laptop" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <span style={{ background: 'rgba(16,185,129,.15)', color: '#059669', borderRadius: 9999, padding: '4px 10px' }}>In stock</span>
                    <span style={{ color: '#737373' }}>Asus &amp; Lenovo</span>
                  </div>
                  <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>New laptops</h3>
                  <p style={{ fontSize: 14.5, color: '#3a3b40', marginTop: 6 }}>Configured, debloated, ready to go. Refurbished options too. Special orders welcome.</p>
                  <div style={{ marginTop: 20, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div>
                      <div className="c03-display c03-num" style={{ fontSize: 30, lineHeight: 1 }}>visit shop</div>
                      <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>try before you buy</div>
                    </div>
                    <a href="/contact" className="c03-btn c03-btn-blue" style={{ fontSize: 14, padding: '10px 16px' }}>View &rarr;</a>
                  </div>
                </div>
              </article>

              <article style={{ borderRadius: 24, background: '#eff6ff', overflow: 'hidden', transition: 'transform .2s ease, box-shadow .2s ease' }}>
                <div className="c03-photo c03-ph-biz" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                    <span style={{ background: 'rgba(252,211,77,.3)', color: '#92400e', borderRadius: 9999, padding: '4px 10px' }}>Refurbished</span>
                    <span style={{ color: '#737373' }}>Tested in shop</span>
                  </div>
                  <h3 className="c03-display" style={{ fontSize: 28, marginTop: 12, marginBottom: 0 }}>Refurbished desktops</h3>
                  <p style={{ fontSize: 14.5, color: '#3a3b40', marginTop: 6 }}>Cleaned, tested, ready to work for years. Great for home, office, or that first family computer.</p>
                  <div style={{ marginTop: 20, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div>
                      <div className="c03-display c03-num" style={{ fontSize: 30, lineHeight: 1 }}>visit shop</div>
                      <div style={{ fontSize: 12.5, color: '#737373', marginTop: 4 }}>great value</div>
                    </div>
                    <a href="/contact" className="c03-btn c03-btn-blue" style={{ fontSize: 14, padding: '10px 16px' }}>View &rarr;</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ background: '#eff6ff' }}>
          <div className="c03-wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div style={{ marginBottom: 48 }}>
              <span className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>what neighbors say</span>
              <h2 className="c03-h2" style={{ marginTop: 8, marginBottom: 0, maxWidth: '20ch' }}>
                Twenty-two years <span style={{ color: '#1d4ed8' }}>of people coming back.</span>
              </h2>
              <p style={{ marginTop: 16, fontSize: 16, color: '#3a3b40', maxWidth: '52ch' }}>
                Read the real Google reviews on our reviews page. The themes that come up over and over:
                honest, friendly, fast, and they actually know what they are doing.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 20 }}>
              <article className="c03-card">
                <div style={{ color: '#eab308', fontSize: 18 }}>[*****]</div>
                <p className="c03-display" style={{ fontSize: 22, marginTop: 12, lineHeight: 1.2 }}>&ldquo;Honest, transparent, and they actually <span className="c03-pencil">explain what they did.</span>&rdquo;</p>
                <div style={{ marginTop: 20, fontSize: 13, color: '#737373' }}>A common theme from Topeka customers on Google Reviews</div>
              </article>
              <article className="c03-card">
                <div style={{ color: '#eab308', fontSize: 18 }}>[*****]</div>
                <p className="c03-display" style={{ fontSize: 22, marginTop: 12, lineHeight: 1.2 }}>&ldquo;They <span className="c03-pencil">saved me from buying a new computer</span> I did not need.&rdquo;</p>
                <div style={{ marginTop: 20, fontSize: 13, color: '#737373' }}>A common theme from Topeka customers on Google Reviews</div>
              </article>
              <article className="c03-card">
                <div style={{ color: '#eab308', fontSize: 18 }}>[*****]</div>
                <p className="c03-display" style={{ fontSize: 22, marginTop: 12, lineHeight: 1.2 }}>&ldquo;Twenty years a customer. <span className="c03-pencil">Will not go anywhere else.</span>&rdquo;</p>
                <div style={{ marginTop: 20, fontSize: 13, color: '#737373' }}>A common theme from Topeka customers on Google Reviews</div>
              </article>
            </div>
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <a href="/reviews" className="c03-btn c03-btn-blue">Read our Google reviews &rarr;</a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="visit" style={{ background: '#fbfaf6', position: 'relative', overflow: 'hidden' }}>
          <div className="c03-blob-2" style={{ position: 'absolute', bottom: -128, right: -96, width: 460, height: 460, background: 'rgba(219,234,254,.7)' }} aria-hidden></div>
          <div className="c03-blob-3" style={{ position: 'absolute', top: -64, left: -64, width: 260, height: 260, background: '#eff6ff' }} aria-hidden></div>

          <div className="c03-wrap" style={{ position: 'relative', paddingTop: 112, paddingBottom: 112 }}>
            <div className="c03-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>stop by</span>
                <h2 className="c03-display" style={{ fontSize: 58, marginTop: 8, marginBottom: 0 }}>
                  Come on by.<br />
                  <span style={{ color: '#1d4ed8' }}>Or we will come to you.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 18, color: '#3a3b40', maxWidth: '48ch' }}>
                  Walk-ins welcome Monday through Saturday. We will write up a free estimate while you wait.
                  Or have one of our techs come to your home or business. We do that now.
                </p>
                <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <a href="/contact" className="c03-btn c03-btn-blue">Schedule a service call &rarr;</a>
                  <a href="tel:7852673223" className="c03-btn c03-btn-white">Call (785) 267-3223</a>
                </div>
              </div>

              <aside style={{ gridColumn: 'span 12 / span 12', marginTop: 48 }}>
                <div style={{ background: '#fff', borderRadius: 24, padding: 32, boxShadow: 'inset 0 0 0 1px #dbeafe' }}>
                  <div className="c03-hand" style={{ color: '#1d4ed8', fontSize: 22 }}>find us</div>
                  <div className="c03-display" style={{ fontSize: 28, marginTop: 4 }}>2008 SW Gage Blvd<br />Topeka, KS 66604</div>

                  <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 6, fontSize: 15 }}>
                    <span style={{ color: '#737373' }}>Mon to Fri</span><span>10 am to 6 pm</span>
                    <span style={{ color: '#737373' }}>Saturday</span><span>10 am to 2 pm</span>
                    <span style={{ color: '#737373' }}>Sunday</span><span style={{ color: '#737373' }}>closed</span>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #dbeafe', fontSize: 14, color: '#3a3b40' }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Can not make it during the day?</div>
                    Now booking house calls. Call <span style={{ color: '#1d4ed8', fontWeight: 600 }}>(785) 267-3223</span> to arrange a visit.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#1d4ed8', color: '#fff' }}>
          <div className="c03-wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="c03-grid">
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 40, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <p className="c03-display" style={{ fontSize: 26, marginTop: 20, lineHeight: 1.1, maxWidth: '24ch' }}>
                  A small computer shop on SW Gage Boulevard.
                </p>
                <p className="c03-hand" style={{ color: '#dbeafe', fontSize: 20, marginTop: 8 }}>locally owned since 2003</p>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,.9)', marginBottom: 12 }}>Services</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,.8)', fontSize: 14, display: 'grid', rowGap: 6 }}>
                  <li>Diagnostics</li><li>Virus cleanup</li><li>Data services</li><li>Custom builds</li><li>Upgrades</li><li>Free recycling</li>
                </ul>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,.9)', marginBottom: 12 }}>The shop</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,.8)', fontSize: 14, display: 'grid', rowGap: 6 }}>
                  <li>About us</li><li>Visit</li><li>Reviews</li><li>Protection plans</li><li>Gift cards</li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.15)' }}>
            <div className="c03-wrap" style={{ paddingTop: 20, paddingBottom: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>
              <div>(c) 2026 Computer Store Kansas . 2008 SW Gage Blvd, Topeka KS</div>
              <div className="c03-hand" style={{ fontSize: 16 }}>made with care in Kansas</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
