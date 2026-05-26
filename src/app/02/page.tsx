/**
 * DESIGN CONCEPT 02 - Technical / Workshop
 *
 * Standalone redesign concept for Computer Store Kansas. Trust-through-craft
 * direction: engineering grid backgrounds, monospace accents, spec-sheet
 * service rows, and an in-shop status panel. Available at /02.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concept 02 / Technical Workshop',
  description: 'Redesign concept: a technical, workshop-style direction for Computer Store Kansas.',
  robots: { index: false, follow: false },
};

export default function Concept02TechnicalPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .c02-root{background:#f8f9fb;color:#0a0a0a;font-family:'IBM Plex Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:14.5px;line-height:1.55}
          .c02-root *{box-sizing:border-box}
          .c02-mono{font-family:'IBM Plex Mono',ui-monospace,monospace;font-feature-settings:"ss01","ss02"}
          .c02-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
          .c02-grid-bg{
            background-image:
              linear-gradient(rgba(37,99,235,.06) 1px,transparent 1px),
              linear-gradient(90deg,rgba(37,99,235,.06) 1px,transparent 1px);
            background-size:32px 32px;background-position:-1px -1px;
          }
          .c02-dot-bg{background-image:radial-gradient(rgba(10,10,10,.18) 1px,transparent 1px);background-size:14px 14px}
          .c02-crop{position:relative}
          .c02-crop::before,.c02-crop::after,.c02-crop>i::before,.c02-crop>i::after{content:"";position:absolute;width:10px;height:10px;border:1.5px solid #0a0a0a}
          .c02-crop::before{top:-1px;left:-1px;border-right:none;border-bottom:none}
          .c02-crop::after{top:-1px;right:-1px;border-left:none;border-bottom:none}
          .c02-crop>i{position:absolute;inset:0;pointer-events:none}
          .c02-crop>i::before{bottom:-1px;left:-1px;border-right:none;border-top:none}
          .c02-crop>i::after{bottom:-1px;right:-1px;border-left:none;border-top:none}
          .c02-schem-rule{display:flex;align-items:center;gap:1rem;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#737373}
          .c02-schem-rule::before,.c02-schem-rule::after{content:"";flex:1;height:1px;background:rgba(10,10,10,.3)}
          .c02-term{background:#0a0a0a;color:#e7e5e0;font-family:'IBM Plex Mono',monospace;font-size:13px;line-height:1.65;border-radius:6px;overflow:hidden}
          .c02-term-hd{background:#1a1a1a;color:#9aa0a6;padding:.5rem .9rem;font-size:11px;letter-spacing:.12em;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a2a2a}
          .c02-led{width:8px;height:8px;border-radius:50%;display:inline-block}
          .c02-blink{animation:c02blink 1.2s steps(2) infinite}
          @keyframes c02blink{50%{opacity:.25}}
          .c02-photo{background-size:cover;background-position:center;background-color:#0a0a0a}
          .c02-ph-bench{background-image:url('/assets/CSK2.jpg')}
          .c02-ph-pc{background-image:url('/assets/gaming-pc-hero.png')}
          .c02-ph-laptop{background-image:url('/assets/laptop-hero.png')}
          .c02-ph-biz{background-image:url('/assets/business-pc-hero.png')}
          .c02-ph-shop{background-image:url('/assets/CSK1.jpg')}
          .c02-spec-row{display:grid;grid-template-columns:88px 1fr auto;gap:1rem;padding:.75rem 0;border-top:1px dashed rgba(10,10,10,.2);align-items:baseline}
          .c02-spec-row:first-child{border-top:1px solid #0a0a0a}
          .c02-pill{display:inline-flex;align-items:center;gap:.4rem;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.08em;padding:3px 8px;border:1px solid #0a0a0a;text-transform:uppercase;background:#fff;color:#0a0a0a;border-radius:0}
          .c02-pill-blue{border-color:#1d4ed8;color:#1d4ed8}
          .c02-pill-green{border-color:#059669;color:#059669}
          .c02-badge-iso{border:1.5px solid #0a0a0a;padding:.6rem .8rem;font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;background:#fff}
          .c02-h-disp{font-weight:700;letter-spacing:-.02em;line-height:.95}
          .c02-btn-primary{background:#0a0a0a;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.05em;padding:.85rem 1.4rem;display:inline-flex;align-items:center;gap:.7rem;text-decoration:none;transition:background .2s ease}
          .c02-btn-primary:hover{background:#1d4ed8}
          .c02-btn-ghost{border:1px solid #0a0a0a;font-family:'IBM Plex Mono',monospace;font-size:13px;letter-spacing:.05em;padding:.8rem 1.4rem;display:inline-flex;align-items:center;gap:.7rem;color:#0a0a0a;text-decoration:none;transition:all .2s ease}
          .c02-btn-ghost:hover{background:#0a0a0a;color:#fff}
          .c02-tick{color:#059669;font-family:'IBM Plex Mono',monospace;font-size:14px}
          .c02-wrap{max-width:1320px;margin:0 auto;padding-left:24px;padding-right:24px}
          .c02-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:32px}
        `,
        }}
      />

      <main className="c02-root">
        {/* Concept header bar */}
        <aside style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0a0a0a', color: '#fff' }}>
          <div className="c02-wrap" style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="c02-mono" style={{ color: '#3b82f6', fontSize: 11, letterSpacing: '.15em' }}>CONCEPT_02</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Technical / Workshop</span>
          </div>
        </aside>

        {/* NAV */}
        <header style={{ background: '#fff', borderBottom: '2px solid #0a0a0a' }}>
          <div className="c02-wrap" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 36, width: 'auto' }} />
              <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.16em', color: '#737373', borderLeft: '1px solid rgba(10,10,10,.3)', paddingLeft: 20 }}>
                REV. 2026 . 2008 SW GAGE BLVD<br />
                <span style={{ color: '#059669' }}>&bull;</span> SHOP OPEN
              </div>
            </div>
            <nav style={{ display: 'flex', gap: 28 }} className="c02-mono">
              <a href="#services" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: 12.5, letterSpacing: '.06em' }}>/services</a>
              <a href="#shop" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: 12.5, letterSpacing: '.06em' }}>/in-store-pcs</a>
              <a href="#trust" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: 12.5, letterSpacing: '.06em' }}>/trust</a>
              <a href="/contact" style={{ color: '#0a0a0a', textDecoration: 'none', fontSize: 12.5, letterSpacing: '.06em' }}>/visit</a>
            </nav>
            <a href="tel:7852673223" className="c02-btn-primary">CALL_785.267.3223</a>
          </div>
        </header>

        {/* HERO */}
        <section className="c02-grid-bg" style={{ background: '#f8f9fb', borderBottom: '1px solid rgba(10,10,10,.15)' }}>
          <div className="c02-wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 48 }} className="c02-mono">
              <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#737373' }}>FILE: HOMEPAGE/INDEX.HTML . ZONE: TOPEKA-66604 . LAT 39.0312, LON -95.7068</div>
              <div style={{ fontSize: 11, letterSpacing: '.16em', color: '#737373' }}>SHOP UPTIME: 22 YEARS . <span style={{ color: '#059669' }}>&bull;</span> WALK-INS WELCOME</div>
            </div>

            <div className="c02-grid">
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#1d4ed8', marginBottom: 20 }}>
                  [ DIAGNOSE . REPAIR . BUILD . RECYCLE ] EST. 2003
                </div>
                <h1 className="c02-h-disp" style={{ fontSize: 64, margin: 0 }}>
                  We open<br />the case.<br />
                  <span style={{ color: '#1d4ed8' }}>We write<br />down what<br />we find.</span>
                </h1>
                <p className="c02-mono" style={{ marginTop: 32, fontSize: 13.5, color: 'rgba(10,10,10,.85)', maxWidth: '58ch', lineHeight: 1.65 }}>
                  A real workshop on SW Gage Blvd in Topeka. Certified technicians, real benches,
                  thousands of parts on hand. Every job opens with a written diagnostic and a clear
                  estimate. <span style={{ color: '#1d4ed8' }}>The diagnostic fee rolls into your repair. Non-commissioned techs, always.</span>
                </p>
                <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href="/contact" className="c02-btn-primary">$ schedule-diagnostic</a>
                  <a href="/contact" className="c02-btn-ghost">$ book-house-call</a>
                </div>

                <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, maxWidth: 640 }}>
                  <div className="c02-badge-iso">
                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>SINCE 2003</span>
                    <span>22 years on bench</span>
                    <span style={{ color: '#737373', textTransform: 'none', letterSpacing: 'normal', fontSize: 10.5, marginTop: 4 }}>Locally owned, never sold</span>
                  </div>
                  <div className="c02-badge-iso">
                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>CERTIFIED</span>
                    <span>Technicians on staff</span>
                    <span style={{ color: '#737373', textTransform: 'none', letterSpacing: 'normal', fontSize: 10.5, marginTop: 4 }}>All major brands and systems</span>
                  </div>
                  <div className="c02-badge-iso">
                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>DATA-FIRST</span>
                    <span>Backup before work</span>
                    <span style={{ color: '#737373', textTransform: 'none', letterSpacing: 'normal', fontSize: 10.5, marginTop: 4 }}>Your files come first</span>
                  </div>
                  <div className="c02-badge-iso">
                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>R-FREE</span>
                    <span>Recycling included</span>
                    <span style={{ color: '#737373', textTransform: 'none', letterSpacing: 'normal', fontSize: 10.5, marginTop: 4 }}>Data destruction guaranteed</span>
                  </div>
                </div>
              </div>

              <aside style={{ gridColumn: 'span 12 / span 12', marginTop: 32 }}>
                <div className="c02-crop" style={{ background: '#fff', border: '1px solid #0a0a0a' }}><i></i>
                  <div className="c02-photo c02-ph-bench" style={{ aspectRatio: '5 / 4' }}></div>
                  <div className="c02-mono" style={{ padding: '12px 16px', borderTop: '1px solid rgba(10,10,10,.15)', fontSize: 11, letterSpacing: '.1em', color: '#737373', display: 'flex', justifyContent: 'space-between' }}>
                    <span>FIG. A . THE BENCH . 2008 SW GAGE BLVD</span><span>SHOT IN-STORE</span>
                  </div>
                </div>

                <div className="c02-term" style={{ marginTop: 20 }}>
                  <div className="c02-term-hd">
                    <span>csk://shop-status --live</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="c02-led c02-blink" style={{ background: '#10b981' }}></span>ONLINE</span>
                  </div>
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#9aa0a6' }}>$ ./shop.sh --today</div>
                    <div style={{ marginTop: 6 }}>Computer Store Kansas <span style={{ color: '#fff' }}>is open</span>. House calls available.</div>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 6, fontSize: 12.5 }}>
                      <span style={{ color: '#10b981' }}>address</span><span>2008 SW Gage Blvd, Topeka KS 66604</span>
                      <span style={{ color: '#10b981' }}>phone</span><span>(785) 267-3223</span>
                      <span style={{ color: '#10b981' }}>mon-fri</span><span>10:00 - 18:00</span>
                      <span style={{ color: '#10b981' }}>saturday</span><span>10:00 - 14:00</span>
                      <span style={{ color: '#dc2626' }}>sunday</span><span>closed</span>
                      <span style={{ color: '#ffd700' }}>since</span><span>2003 . owner: Max Beyer</span>
                    </div>
                    <div style={{ marginTop: 12, color: '#9aa0a6' }}>$ <span className="c02-blink">|</span></div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* SERVICES SPEC SHEET */}
        <section id="services" style={{ background: '#fff', borderBottom: '1px solid rgba(10,10,10,.15)' }}>
          <div className="c02-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c02-schem-rule" style={{ marginBottom: 12 }}><span>SECTION 01 / SERVICE_CATALOG</span></div>

            <div className="c02-grid" style={{ marginBottom: 48 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <h2 className="c02-h-disp" style={{ fontSize: 44, margin: 0 }}>
                  Every service we offer,<br />
                  <span style={{ color: '#1d4ed8' }}>quoted in writing first.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', alignSelf: 'end' }} className="c02-mono">
                <p style={{ fontSize: 12.5, color: '#737373', lineHeight: 1.7, margin: 0 }}>
                  Every job opens with a written diagnostic. The diagnostic fee rolls into the repair
                  cost if you decide to proceed. No commission, no surprises at the counter.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 48, rowGap: 8 }}>
              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-001 . CORE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Diagnostics</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Thorough troubleshooting to identify the issue quickly and accurately. Diagnostic fee rolls into your repair cost.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill c02-pill-green">rolls into repair</span>
                  <span className="c02-pill c02-pill-blue">walk-in OK</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-002 . CORE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Virus and malware removal</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Complete removal of viruses, malware, spyware, and rootkits. Your computer returned clean and protected.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill c02-pill-green">data preserved</span>
                  <span className="c02-pill">protection tips included</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-003 . CORE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Data transfer and cloning</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Move your files, settings, and programs to a new computer. Drive cloning and data recovery available.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill">recovery option</span>
                  <span className="c02-pill c02-pill-blue">drive cloning</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-004 . CORE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>OS installation</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Fresh Windows or Linux installation. Dual-boot setups available. Windows license included with install.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill">windows license included</span>
                  <span className="c02-pill c02-pill-blue">linux dual-boot</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-005 . CORE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Hardware upgrades</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>RAM, SSD, graphics cards, processors, and more. Breathe new life into your existing computer.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill c02-pill-green">honest "don\'t upgrade" advice</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-006 . FEATURED</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Custom built PCs</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Gaming rigs, workstations, home offices, servers. Quality parts, expert assembly, free lifetime diagnostics on every build.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill">free lifetime diagnostics</span>
                  <span className="c02-pill c02-pill-blue">clean cable management</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-007 . CATALOG</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Laptops and printers</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>New Asus and Lenovo laptops plus refurbished options. New Brother printers with $50 in-home setup available.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill">asus and lenovo</span>
                  <span className="c02-pill c02-pill-blue">brother printers</span>
                </div>
              </article>

              <article style={{ padding: '28px 0', borderTop: '2px solid #0a0a0a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#737373' }}>SVC-008 . PUBLIC SERVICE</div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.01em', marginTop: 4, marginBottom: 0 }}>Free electronics recycling</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(10,10,10,.8)', marginTop: 8, maxWidth: '44ch' }}>Drop off old computers, TVs, radios, consoles, and more. Data destruction guaranteed. No cost to you.</p>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="c02-pill c02-pill-green">free of charge</span>
                  <span className="c02-pill">data destruction</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* IN-STORE PCS */}
        <section id="shop" className="c02-dot-bg" style={{ background: '#f0f2f5', borderBottom: '1px solid rgba(10,10,10,.15)' }}>
          <div className="c02-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c02-schem-rule" style={{ marginBottom: 12 }}><span>SECTION 02 / SHOWROOM_INVENTORY</span></div>
            <div className="c02-grid" style={{ marginBottom: 48, alignItems: 'end' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <h2 className="c02-h-disp" style={{ fontSize: 44, margin: 0 }}>
                  Built right here.<br />
                  <span style={{ color: '#1d4ed8' }}>Sold, supported, recycled.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12' }} className="c02-mono">
                <p style={{ fontSize: 12.5, color: '#737373', margin: 0 }}>
                  Every PC on our wall was specced, built, and tested in this shop. Free lifetime
                  diagnostics on every custom build. <a href="/computers" style={{ color: '#0a0a0a', textDecoration: 'underline', textUnderlineOffset: 4 }}>Browse the full lineup &rarr;</a>
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 24 }}>
              <article style={{ background: '#fff', border: '1px solid #0a0a0a', display: 'flex', flexDirection: 'column' }}>
                <div className="c02-photo c02-ph-pc" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c02-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>
                    <span>BUILD . CUSTOM</span>
                    <span style={{ color: '#059669' }}>&bull; AVAILABLE</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 0 }}>Gaming PC</h3>
                  <p style={{ fontSize: 13.5, color: '#737373', marginTop: 4 }}>Built to your spec</p>
                  <div className="c02-mono" style={{ marginTop: 16, fontSize: 12.5, lineHeight: 1.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>USE</span><span>Gaming, streaming, VR</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>PARTS</span><span>Spec\'d with you</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>CABLES</span><span>Clean managed</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>WARRANTY</span><span>Lifetime diag</span></div>
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid rgba(10,10,10,.15)', paddingTop: 16 }}>
                    <div>
                      <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>QUOTE</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>request</div>
                    </div>
                    <a href="/contact" className="c02-btn-primary" style={{ fontSize: 12, padding: '10px 14px' }}>$ inquire</a>
                  </div>
                </div>
              </article>

              <article style={{ background: '#fff', border: '1px solid #0a0a0a', display: 'flex', flexDirection: 'column' }}>
                <div className="c02-photo c02-ph-laptop" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c02-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>
                    <span>NEW . LAPTOP</span>
                    <span style={{ color: '#059669' }}>&bull; IN STOCK</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 0 }}>New laptops</h3>
                  <p style={{ fontSize: 13.5, color: '#737373', marginTop: 4 }}>Asus and Lenovo</p>
                  <div className="c02-mono" style={{ marginTop: 16, fontSize: 12.5, lineHeight: 1.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>BRANDS</span><span>Asus, Lenovo</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>REFURB</span><span>Available</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>SETUP</span><span>Debloated free</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>CUSTOM</span><span>Special orders OK</span></div>
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid rgba(10,10,10,.15)', paddingTop: 16 }}>
                    <div>
                      <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>STATUS</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>visit shop</div>
                    </div>
                    <a href="/contact" className="c02-btn-primary" style={{ fontSize: 12, padding: '10px 14px' }}>$ inquire</a>
                  </div>
                </div>
              </article>

              <article style={{ background: '#fff', border: '1px solid #0a0a0a', display: 'flex', flexDirection: 'column' }}>
                <div className="c02-photo c02-ph-biz" style={{ aspectRatio: '5 / 4' }}></div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c02-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>
                    <span>REFURB . DESKTOP</span>
                    <span style={{ color: '#059669' }}>&bull; IN STOCK</span>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 0 }}>Refurbished desktops</h3>
                  <p style={{ fontSize: 13.5, color: '#737373', marginTop: 4 }}>Cleaned, tested, ready</p>
                  <div className="c02-mono" style={{ marginTop: 16, fontSize: 12.5, lineHeight: 1.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>TESTED</span><span>Burn-in passed</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>OS</span><span>Fresh install</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>BLOAT</span><span>Removed free</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#737373' }}>USE</span><span>Home, office, school</span></div>
                  </div>
                  <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'end', borderTop: '1px solid rgba(10,10,10,.15)', paddingTop: 16 }}>
                    <div>
                      <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.14em', color: '#737373' }}>STATUS</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>visit shop</div>
                    </div>
                    <a href="/contact" className="c02-btn-primary" style={{ fontSize: 12, padding: '10px 14px' }}>$ inquire</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section id="trust" style={{ background: '#fff', borderBottom: '1px solid rgba(10,10,10,.15)' }}>
          <div className="c02-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c02-schem-rule" style={{ marginBottom: 12 }}><span>SECTION 03 / OPERATING_STANDARDS</span></div>
            <div className="c02-grid" style={{ gap: 40 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <h2 className="c02-h-disp" style={{ fontSize: 44, margin: 0 }}>
                  Five rules<br />
                  <span style={{ color: '#1d4ed8' }}>we work by.</span>
                </h2>
                <p style={{ marginTop: 24, fontSize: 15, color: 'rgba(10,10,10,.8)', maxWidth: '42ch' }}>
                  A computer shop is a small museum of other people&rsquo;s lives. Tax returns, dissertations,
                  photos of grandparents. We treat your drive like it matters, because it does.
                </p>

                <div style={{ marginTop: 40, position: 'relative', border: '1px solid rgba(10,10,10,.3)', background: '#f8f9fb', aspectRatio: '4 / 3' }} className="c02-grid-bg">
                  <div style={{ position: 'absolute', inset: 40, border: '2px solid #0a0a0a', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div className="c02-mono" style={{ fontSize: 10, letterSpacing: '.18em', color: '#737373' }}>YOUR MACHINE</div>
                      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 4 }}>[]</div>
                      <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.12em', color: '#737373', marginTop: 4 }}>ON OUR BENCH</div>
                    </div>
                  </div>
                  <div className="c02-mono" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10.5, letterSpacing: '.1em' }}>
                    <span style={{ color: '#1d4ed8' }}>[1]</span> Logged on intake
                  </div>
                  <div className="c02-mono" style={{ position: 'absolute', top: 8, right: 8, fontSize: 10.5, letterSpacing: '.1em', textAlign: 'right' }}>
                    <span style={{ color: '#1d4ed8' }}>[2]</span> Data backed up first
                  </div>
                  <div className="c02-mono" style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 10.5, letterSpacing: '.1em' }}>
                    <span style={{ color: '#1d4ed8' }}>[3]</span> Estimate in writing
                  </div>
                  <div className="c02-mono" style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 10.5, letterSpacing: '.1em', textAlign: 'right' }}>
                    <span style={{ color: '#1d4ed8' }}>[4]</span> Tested before pickup
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div style={{ border: '2px solid #0a0a0a', background: '#fff' }}>
                  <div className="c02-mono" style={{ padding: '12px 20px', borderBottom: '1px solid #0a0a0a', display: 'flex', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.14em' }}>
                    <span>CSK / OPERATING_STANDARDS . 2026</span>
                    <span style={{ color: '#059669' }}>&bull; CURRENT</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.01</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Expertise and experience</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>Over 20 years diagnosing and fixing every kind of computer issue. We keep learning every week.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.02</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Fast and reliable service</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>Quick response times, efficient processes, and quality checks before your machine goes home.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.03</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Honest, transparent pricing</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>Clear estimates upfront. No surprises at the counter. Non-commissioned techs, ever.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.04</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>We protect your data</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>Our first priority is backing up and protecting your files in case of failure or accidental deletion.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.05</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Local and personal</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>You are not a ticket number. We are your neighbors on Gage Blvd, and we will be here tomorrow.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                    <div className="c02-spec-row">
                      <span className="c02-mono" style={{ fontSize: 12, color: '#737373' }}>P.06</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>Free electronics recycling</div>
                        <div style={{ fontSize: 13, color: 'rgba(10,10,10,.75)', marginTop: 2 }}>Drop off any old machine for free. Data destruction guaranteed on every drive.</div>
                      </div>
                      <span className="c02-tick">[x]</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', border: '1px solid #0a0a0a', background: '#fff', textAlign: 'center' }}>
                  <div style={{ padding: 20, borderRight: '1px solid rgba(10,10,10,.3)' }}>
                    <div className="c02-num" style={{ fontSize: 36, fontWeight: 700 }}>22</div>
                    <div className="c02-mono" style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#737373', marginTop: 4 }}>YEARS . LOCALLY OWNED</div>
                  </div>
                  <div style={{ padding: 20, borderRight: '1px solid rgba(10,10,10,.3)' }}>
                    <div className="c02-num" style={{ fontSize: 36, fontWeight: 700 }}>2003</div>
                    <div className="c02-mono" style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#737373', marginTop: 4 }}>EST . MAX BEYER OWNS</div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div className="c02-num" style={{ fontSize: 36, fontWeight: 700 }}>1,000+</div>
                    <div className="c02-mono" style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#737373', marginTop: 4 }}>SATISFIED . CUSTOMERS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#0a0a0a', color: '#fff' }}>
          <div className="c02-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c02-grid" style={{ gap: 40, alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: '#3b82f6', marginBottom: 20 }}>[ SCHEDULE . SERVICE . CALL ]</div>
                <h2 className="c02-h-disp" style={{ fontSize: 44, margin: 0 }}>
                  Drop it on the bench.<br />
                  <span style={{ color: '#3b82f6' }}>Or we will come to you.</span>
                </h2>
                <p className="c02-mono" style={{ marginTop: 24, fontSize: 13.5, color: 'rgba(255,255,255,.75)', maxWidth: '60ch' }}>
                  $ csk schedule --diagnostic <span style={{ color: 'rgba(255,255,255,.45)' }}># walk in or book online</span><br />
                  $ csk house-call --topeka <span style={{ color: 'rgba(255,255,255,.45)' }}># now booking on-site visits</span>
                </p>
                <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href="/contact" style={{ background: '#fff', color: '#0a0a0a', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, padding: '14px 20px', textDecoration: 'none' }}>$ schedule</a>
                  <a href="tel:7852673223" style={{ border: '1px solid rgba(255,255,255,.4)', color: '#fff', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, padding: '14px 20px', textDecoration: 'none' }}>$ call (785) 267-3223</a>
                </div>
              </div>
              <aside style={{ gridColumn: 'span 12 / span 12' }}>
                <div style={{ border: '1px solid rgba(255,255,255,.25)', padding: 24 }}>
                  <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: 'rgba(255,255,255,.6)', marginBottom: 16 }}>THE_SHOP</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>2008 SW Gage Blvd</div>
                  <div style={{ color: 'rgba(255,255,255,.7)', marginTop: 4 }}>Topeka, KS 66604</div>

                  <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.18em', color: 'rgba(255,255,255,.6)', marginTop: 24, marginBottom: 12 }}>HOURS . CDT</div>
                  <div className="c02-mono" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4, fontSize: 12.5 }}>
                    <span style={{ color: 'rgba(255,255,255,.6)' }}>MON-FRI</span><span>10:00 - 18:00</span>
                    <span style={{ color: 'rgba(255,255,255,.6)' }}>SAT</span><span>10:00 - 14:00</span>
                    <span style={{ color: 'rgba(255,255,255,.6)' }}>SUN</span><span style={{ color: 'rgba(255,255,255,.45)' }}>closed</span>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                    <span className="c02-led c02-blink" style={{ background: '#10b981' }}></span>
                    <span className="c02-mono">house calls now booking across topeka</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#0a0a0a', color: '#fff', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div className="c02-wrap" style={{ paddingTop: 48, paddingBottom: 48 }}>
            <div className="c02-grid" style={{ fontSize: 13 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <p className="c02-mono" style={{ color: 'rgba(255,255,255,.55)', marginTop: 16, maxWidth: 384, fontSize: 12, lineHeight: 1.8 }}>
                  # Computer Store Kansas<br /># Independent computer shop<br /># Topeka, Kansas . since 2003<br /># owner: max beyer
                </p>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 24 }}>
                <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.16em', color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>/services</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,.85)', display: 'grid', rowGap: 6 }}>
                  <li>Diagnostics</li><li>Virus removal</li><li>Data services</li><li>Upgrades</li><li>Custom builds</li><li>Recycling</li>
                </ul>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 24 }}>
                <div className="c02-mono" style={{ fontSize: 11, letterSpacing: '.16em', color: 'rgba(255,255,255,.45)', marginBottom: 12 }}>/shop</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'rgba(255,255,255,.85)', display: 'grid', rowGap: 6 }}>
                  <li>New laptops</li><li>Custom PCs</li><li>Refurb desktops</li><li>Brother printers</li><li>Protection plans</li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div className="c02-wrap c02-mono" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: 11, letterSpacing: '.1em', color: 'rgba(255,255,255,.45)' }}>
              <div>(C) 2026 COMPUTER STORE KANSAS . 2008 SW GAGE BLVD, TOPEKA KS</div>
              <div>BUILD 2026 . IBM_PLEX_SANS . IBM_PLEX_MONO</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
