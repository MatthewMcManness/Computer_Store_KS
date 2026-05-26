/**
 * DESIGN CONCEPT 04 - Bold Showroom
 *
 * Standalone redesign concept for Computer Store Kansas. Dark-mode,
 * product-photography-led direction with bold typography, a big hero
 * featured PC, and an e-commerce energy. Available at /04.
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Concept 04 / Bold Showroom',
  description: 'Redesign concept: a dark-mode, product-led showroom direction for Computer Store Kansas.',
  robots: { index: false, follow: false },
};

export default function Concept04BoldShowroomPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .c04-root{background:#08090b;color:#fff;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.55}
          .c04-root *{box-sizing:border-box}
          .c04-mono{font-family:'DM Mono',ui-monospace,monospace}
          .c04-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
          .c04-display{font-weight:900;letter-spacing:-.045em;line-height:.92}
          .c04-smcaps{text-transform:uppercase;letter-spacing:.14em;font-weight:700;font-size:11px}
          .c04-hero-grad{
            background:
              radial-gradient(1200px 700px at 70% 20%, rgba(59,130,246,.45), transparent 60%),
              radial-gradient(900px 600px at 20% 80%, rgba(30,64,175,.55), transparent 60%),
              linear-gradient(180deg, #0c1430 0%, #08090b 100%);
          }
          .c04-ticker{display:flex;gap:3rem;animation:c04marquee 38s linear infinite;width:max-content}
          @keyframes c04marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
          .c04-photo{background-size:cover;background-position:center;background-color:#111}
          .c04-ph-hero{background-image:url('/assets/gaming-pc-hero.png')}
          .c04-ph-pc1{background-image:url('/assets/gaming-pc-hero.png')}
          .c04-ph-pc2{background-image:url('/assets/business-pc-hero.png')}
          .c04-ph-laptop{background-image:url('/assets/laptop-hero.png')}
          .c04-ph-mini{background-image:url('/assets/CSK3.jpg')}
          .c04-ph-floor{background-image:url('/assets/CSK1.jpg')}
          .c04-ph-shop{background-image:url('/assets/CSK2.jpg')}
          .c04-tag{background:#ffd700;color:#000;clip-path:polygon(7% 0, 100% 0, 100% 100%, 7% 100%, 0 50%);padding:.7rem 1.1rem .7rem 1.6rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:900;letter-spacing:-.01em;position:relative}
          .c04-tag::before{content:"";position:absolute;left:14px;top:50%;transform:translateY(-50%);width:8px;height:8px;background:#08090b;border-radius:50%}
          .c04-save-chip{background:#10b981;color:#fff;font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:.35rem .6rem;border-radius:3px}
          .c04-red-chip{background:#dc2626;color:#fff;font-weight:800;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:.35rem .6rem;border-radius:3px}
          .c04-card{background:linear-gradient(180deg,#0f1115 0%, #0c0e12 100%);border:1px solid rgba(255,255,255,.08);transition:transform .25s ease, border-color .25s ease}
          .c04-card:hover{transform:translateY(-4px);border-color:rgba(59,130,246,.5)}
          .c04-btn-pri{background:#fff;color:#0a0a0a;font-weight:800;letter-spacing:-.005em;padding:1rem 1.6rem;display:inline-flex;align-items:center;gap:.6rem;border-radius:2px;text-decoration:none;transition:all .2s ease}
          .c04-btn-pri:hover{background:#3b82f6;color:#fff}
          .c04-btn-blue{background:#2563eb;color:#fff;font-weight:800;padding:1rem 1.6rem;display:inline-flex;align-items:center;gap:.6rem;border-radius:2px;text-decoration:none;transition:background .2s ease}
          .c04-btn-blue:hover{background:#1d4ed8}
          .c04-btn-ghost{border:1px solid rgba(255,255,255,.25);color:#fff;font-weight:700;padding:1rem 1.5rem;display:inline-flex;align-items:center;gap:.6rem;border-radius:2px;text-decoration:none;transition:background .2s ease}
          .c04-btn-ghost:hover{background:rgba(255,255,255,.08)}
          .c04-hr{height:1px;background:rgba(255,255,255,.08)}
          .c04-vignette{background:radial-gradient(ellipse at center, transparent 40%, rgba(8,9,11,.85) 100%)}
          .c04-wrap{max-width:1440px;margin:0 auto;padding-left:24px;padding-right:24px}
          .c04-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:32px}
        `,
        }}
      />

      <main className="c04-root">
        {/* Concept header bar */}
        <aside style={{ position: 'sticky', top: 0, zIndex: 50, background: '#000', borderBottom: '1px solid rgba(255,255,255,.1)', fontSize: 12.5 }}>
          <div className="c04-wrap" style={{ paddingTop: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="c04-smcaps" style={{ color: '#3b82f6' }}>Concept 04</span>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.01em' }}>Bold Showroom</span>
            <span style={{ color: 'rgba(255,255,255,.7)', fontStyle: 'italic' }}>dark mode, product-first energy for a 22-year-old Topeka shop</span>
          </div>
        </aside>

        {/* Sale ticker */}
        <div style={{ background: '#2563eb', color: '#fff', overflow: 'hidden', borderBottom: '1px solid rgba(0,0,0,.3)' }}>
          <div className="c04-ticker" style={{ paddingTop: 10, paddingBottom: 10, fontSize: 13, fontWeight: 700, letterSpacing: '-.01em' }}>
            <div style={{ display: 'flex', gap: 48, flexShrink: 0 }}>
              <span>HOUSE CALLS NOW BOOKING ACROSS TOPEKA</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>FREE ELECTRONICS RECYCLING WITH DATA DESTRUCTION</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>FREE LIFETIME DIAGNOSTICS ON EVERY CUSTOM BUILD</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>DIAGNOSTIC FEE ROLLS INTO YOUR REPAIR</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
            </div>
            <div style={{ display: 'flex', gap: 48, flexShrink: 0 }}>
              <span>HOUSE CALLS NOW BOOKING ACROSS TOPEKA</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>FREE ELECTRONICS RECYCLING WITH DATA DESTRUCTION</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>FREE LIFETIME DIAGNOSTICS ON EVERY CUSTOM BUILD</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
              <span>DIAGNOSTIC FEE ROLLS INTO YOUR REPAIR</span>
              <span style={{ color: '#dbeafe' }}>&bull;</span>
            </div>
          </div>
        </div>

        {/* NAV */}
        <header style={{ background: '#08090b', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div className="c04-wrap" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              </a>
              <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14, fontWeight: 600 }}>
                <a href="#shop" style={{ color: '#fff', textDecoration: 'none' }}>Computers</a>
                <a href="#shop" style={{ color: '#fff', textDecoration: 'none' }}>Laptops</a>
                <a href="#shop" style={{ color: '#fff', textDecoration: 'none' }}>Refurbished</a>
                <a href="#services" style={{ color: '#fff', textDecoration: 'none' }}>Repair</a>
                <a href="#why" style={{ color: '#fff', textDecoration: 'none' }}>Why CSK</a>
              </nav>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.05)', borderRadius: 4, padding: '8px 12px', width: 288 }}>
                <span style={{ color: 'rgba(255,255,255,.4)', marginRight: 8 }}>[s]</span>
                <input style={{ background: 'transparent', color: '#fff', width: '100%', outline: 'none', border: 'none' }} placeholder="Search services, parts, computers..." />
              </div>
              <a href="/contact" style={{ background: '#fff', color: '#000', fontWeight: 700, padding: '8px 16px', borderRadius: 4, textDecoration: 'none' }}>Schedule</a>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="c04-hero-grad" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="c04-wrap" style={{ paddingTop: 56, paddingBottom: 96, position: 'relative' }}>
            <div className="c04-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                  <span className="c04-red-chip">[*] FEATURED BUILD</span>
                  <span className="c04-smcaps" style={{ color: 'rgba(255,255,255,.6)' }}>Built on the bench at 2008 SW Gage</span>
                </div>
                <h1 className="c04-display" style={{ fontSize: 88, margin: 0, letterSpacing: '-0.05em' }}>
                  CUSTOM PCs.<br />
                  <span style={{ color: '#3b82f6' }}>BUILT IN</span><br />
                  <span style={{ color: '#fff' }}>TOPEKA.</span>
                </h1>
                <p style={{ marginTop: 32, fontSize: 18, color: 'rgba(255,255,255,.8)', maxWidth: '44ch', lineHeight: 1.5 }}>
                  Gaming, workstation, home office, server. Specced with one of our techs, parts at fair pricing, clean cable management,
                  stress-tested before pickup, free lifetime diagnostics for as long as you own it.
                </p>

                <div style={{ marginTop: 36, display: 'flex', alignItems: 'end', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.55)' }}>Get a quote</div>
                    <div style={{ display: 'flex', alignItems: 'end', gap: 16 }}>
                      <div className="c04-display c04-num" style={{ fontSize: 88, lineHeight: .85, color: '#ffd700' }}>FREE</div>
                      <div style={{ paddingBottom: 12 }}>
                        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 14 }}>diagnostic rolls into</div>
                        <div className="c04-save-chip" style={{ marginTop: 4 }}>YOUR REPAIR COST</div>
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 13, marginTop: 8 }}>Custom-built PCs quoted to your spec</div>
                  </div>
                </div>

                <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href="/contact" className="c04-btn-pri">SPEC YOUR BUILD <span>&rarr;</span></a>
                  <a href="#shop" className="c04-btn-ghost">SEE ALL COMPUTERS</a>
                </div>

                <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 12.5, color: 'rgba(255,255,255,.65)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#10b981' }}>&bull;</span> Open today, walk-ins welcome</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'rgba(255,255,255,.4)' }}>[+]</span> Free local pickup</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'rgba(255,255,255,.4)' }}>[~]</span> 22 years on Gage Boulevard</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: 'rgba(255,255,255,.4)' }}>[*]</span> 1,000+ satisfied customers</div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 12 / span 12', position: 'relative', marginTop: 48 }}>
                <div className="c04-photo c04-ph-hero" style={{ width: '100%', aspectRatio: '5 / 6' }}></div>
                <div className="c04-vignette" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
                <div className="c04-tag" style={{ position: 'absolute', top: 32, left: -16, fontSize: 22 }}>
                  <span className="c04-mono" style={{ fontSize: 11, letterSpacing: 'normal', marginBottom: -4 }}>QUOTE</span>FREE
                </div>
                <div className="c04-mono" style={{ position: 'absolute', bottom: 40, right: 16, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.1)', padding: 16, borderRadius: 4, fontSize: 12.5, lineHeight: 1.7, minWidth: 220 }}>
                  <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>FEATURED BUILD</div>
                  <div>YOUR CPU CHOICE</div>
                  <div>YOUR GPU CHOICE</div>
                  <div>YOUR RAM SPEC</div>
                  <div>YOUR STORAGE</div>
                  <div style={{ color: '#10b981', marginTop: 8 }}>&bull; STRESS-TESTED BEFORE PICKUP</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHOP */}
        <section id="shop" style={{ background: '#08090b', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="c04-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: 24, marginBottom: 40 }}>
              <div>
                <span className="c04-smcaps" style={{ color: '#3b82f6' }}>Showroom . from our shop floor in Topeka</span>
                <h2 className="c04-display" style={{ fontSize: 52, marginTop: 12, marginBottom: 0 }}>
                  Try it before<br />
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>you take it home.</span>
                </h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 13, fontWeight: 600 }}>
                <button style={{ background: '#fff', color: '#000', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>All</button>
                <button style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>Gaming</button>
                <button style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>Workstation</button>
                <button style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>Laptops</button>
                <button style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>Refurbished</button>
                <button style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.8)', padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer' }}>Printers</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 20 }}>
              <article className="c04-card" style={{ gridColumn: 'span 2 / span 2', gridRow: 'span 2 / span 2', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <div className="c04-photo c04-ph-pc1" style={{ aspectRatio: '4 / 3' }}></div>
                  <span className="c04-red-chip" style={{ position: 'absolute', top: 16, left: 16 }}>FEATURED</span>
                  <span className="c04-save-chip" style={{ position: 'absolute', top: 16, right: 16 }}>[*] BUILT IN SHOP</span>
                  <div className="c04-tag" style={{ position: 'absolute', bottom: 16, left: 16, fontSize: 20 }}>
                    <span className="c04-mono" style={{ fontSize: 10, letterSpacing: 'normal', marginBottom: -4 }}>QUOTE</span>FREE
                  </div>
                </div>
                <div style={{ padding: 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c04-mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.55)' }}>
                    <span>CUSTOM BUILD</span><span>.</span><span style={{ color: '#10b981' }}>SPEC AVAILABLE</span>
                  </div>
                  <h3 className="c04-display" style={{ fontSize: 42, marginTop: 8, marginBottom: 0 }}>Gaming PC</h3>
                  <p style={{ color: 'rgba(255,255,255,.65)', marginTop: 8, fontSize: 14.5 }}>Built to spec on the bench. Quiet enough for a home office, fast enough for the games you actually play.</p>

                  <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 24, rowGap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>CPU</span><span style={{ fontWeight: 600 }}>your choice</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>GPU</span><span style={{ fontWeight: 600 }}>your choice</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>RAM</span><span style={{ fontWeight: 600 }}>up to 128 GB</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>SSD</span><span style={{ fontWeight: 600 }}>up to 8 TB NVMe</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>WARRANTY</span><span style={{ fontWeight: 600 }}>lifetime diag</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.05)', padding: '6px 0' }}><span style={{ color: 'rgba(255,255,255,.55)' }}>BUILT</span><span style={{ fontWeight: 600 }}>in Topeka</span></div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div>
                      <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>QUOTE TO YOUR SPEC</div>
                      <div className="c04-display c04-num" style={{ fontSize: 36, color: '#ffd700', lineHeight: 1 }}>contact us</div>
                      <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, marginTop: 4 }}>diagnostics rolled in</div>
                    </div>
                    <a href="/contact" className="c04-btn-pri">SPEC IT &rarr;</a>
                  </div>
                </div>
              </article>

              <article className="c04-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <div className="c04-photo c04-ph-laptop" style={{ aspectRatio: '5 / 4' }}></div>
                  <span className="c04-save-chip" style={{ position: 'absolute', top: 12, right: 12 }}>NEW</span>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>LAPTOPS . ASUS / LENOVO</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4, marginBottom: 0 }}>New laptops</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>Configured, debloated, ready to use</p>
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div className="c04-display c04-num" style={{ fontSize: 22 }}>in stock</div>
                    <a href="/contact" style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>VIEW &rarr;</a>
                  </div>
                </div>
              </article>

              <article className="c04-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <div className="c04-photo c04-ph-mini" style={{ aspectRatio: '5 / 4' }}></div>
                  <span className="c04-save-chip" style={{ position: 'absolute', top: 12, right: 12 }}>REFURB</span>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>DESKTOPS . REFURBISHED</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4, marginBottom: 0 }}>Refurbished desktops</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>Cleaned, tested, ready to work</p>
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div className="c04-display c04-num" style={{ fontSize: 22 }}>in stock</div>
                    <a href="/contact" style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>VIEW &rarr;</a>
                  </div>
                </div>
              </article>

              <article className="c04-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <div className="c04-photo c04-ph-pc2" style={{ aspectRatio: '5 / 4' }}></div>
                  <span className="c04-save-chip" style={{ position: 'absolute', top: 12, right: 12 }}>BUSINESS</span>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>BUSINESS PC . SMALL OFFICE</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4, marginBottom: 0 }}>Business PCs</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>Quiet, reliable, built for daily work</p>
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div className="c04-display c04-num" style={{ fontSize: 22 }}>quote us</div>
                    <a href="/contact" style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>VIEW &rarr;</a>
                  </div>
                </div>
              </article>

              <article className="c04-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <div className="c04-photo c04-ph-shop" style={{ aspectRatio: '5 / 4' }}></div>
                  <span className="c04-red-chip" style={{ position: 'absolute', top: 12, right: 12 }}>BROTHER</span>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>PRINTERS . NEW + REPAIR</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4, marginBottom: 0 }}>Printers</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>Brother + in-home setup available</p>
                  <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                    <div className="c04-display c04-num" style={{ fontSize: 22 }}>in stock</div>
                    <a href="/contact" style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>VIEW &rarr;</a>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* COMPARE ROW (the risk) */}
        <section style={{ background: '#0f1115', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="c04-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c04-grid" style={{ marginBottom: 40, alignItems: 'end' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c04-smcaps" style={{ color: '#3b82f6' }}>Compare . local shop vs. big-box retail</span>
                <h2 className="c04-display" style={{ fontSize: 52, marginTop: 12, marginBottom: 0 }}>
                  Better service.<br />
                  <span style={{ color: '#3b82f6' }}>Local bench.</span><br />
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Twenty-two years on Gage.</span>
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', color: 'rgba(255,255,255,.65)', fontSize: 15 }}>
                A real comparison of what you get from a small local computer shop versus the average big-box retailer.
                No exaggerations.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', border: '1px solid rgba(255,255,255,.1)' }}>
              <div style={{ gridColumn: 'span 12 / span 12', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', background: 'rgba(0,0,0,.4)', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20 }} className="c04-smcaps">Comparison</div>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)' }}>
                  <div className="c04-smcaps" style={{ color: '#3b82f6', marginBottom: 4 }}>[*] Recommended</div>
                  <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>Computer Store Kansas</div>
                  <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5 }} className="c04-mono">Local . since 2003</div>
                </div>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)' }}>
                  <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>For reference</div>
                  <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-.02em' }}>Big-box retailer</div>
                  <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12.5 }} className="c04-mono">National chain</div>
                </div>
              </div>

              {[
                ['Who builds your PC', 'A tech in our Topeka shop. You can ask them questions.', 'Factory workers at a plant in another state'],
                ['Up-front diagnostic', 'Written estimate. Fee rolls into the repair cost.', 'Often estimated only after work begins'],
                ['Commission on sales', 'Non-commissioned. Recommendations are honest, period.', 'Often commissioned. Upsells expected.'],
                ['Data protected first', 'Backed up before anything else happens on the bench.', 'Varies; often not the default'],
                ['Lifetime diagnostics', 'Included on every custom build, free.', 'Not standard'],
                ['Free electronics recycling', 'Yes, with guaranteed data destruction.', 'Limited or paid only'],
                ['House calls in Topeka', 'Yes, now booking.', 'Almost never'],
                ['Person you can call by name', 'Yes. The owner is Max Beyer.', 'No'],
              ].map(([label, ours, theirs], i) => (
                <div key={i} style={{ gridColumn: 'span 12 / span 12', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ gridColumn: 'span 4 / span 4', padding: 20, color: 'rgba(255,255,255,.75)' }}>{label}</div>
                  <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)', fontWeight: 600 }}>{ours}</div>
                  <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)' }}>{theirs}</div>
                </div>
              ))}

              <div style={{ gridColumn: 'span 12 / span 12', display: 'grid', gridTemplateColumns: 'repeat(12,minmax(0,1fr))', background: 'rgba(0,0,0,.4)' }}>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20 }} className="c04-smcaps">Track record</div>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)' }}>
                  <div className="c04-display c04-num" style={{ fontSize: 44, color: '#ffd700' }}>22 years</div>
                  <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 12 }} className="c04-num">locally owned, never sold</div>
                </div>
                <div style={{ gridColumn: 'span 4 / span 4', padding: 20, borderLeft: '1px solid rgba(255,255,255,.1)' }}>
                  <div className="c04-display c04-num" style={{ fontSize: 44, color: 'rgba(255,255,255,.7)' }}>varies</div>
                  <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12 }} className="c04-num">depends on store / region</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPAIR / SERVICES */}
        <section id="services" style={{ background: '#08090b', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="c04-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c04-grid" style={{ marginBottom: 40, alignItems: 'end' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c04-smcaps" style={{ color: '#3b82f6' }}>Service department . same building</span>
                <h2 className="c04-display" style={{ fontSize: 52, margin: 0 }}>
                  Repair it.<br />
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Or replace it.</span><br />
                  We will tell you honestly.
                </h2>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', color: 'rgba(255,255,255,.65)', fontSize: 15 }}>
                Every drop-off opens with a written diagnostic. The fee rolls into your repair if you go ahead.
                If we cannot fix it economically, we will say so.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>
              <a href="/services/diagnostics" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-001</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Diagnostics</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Written estimate, fee rolls in</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>STARTS</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">honest</div></div>
                  <span className="c04-save-chip">CORE</span>
                </div>
              </a>
              <a href="/services/virus-removal" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-002</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Virus &amp; malware removal</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Cleaned, protected, explained</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>STARTS</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">same week</div></div>
                  <span className="c04-save-chip">CORE</span>
                </div>
              </a>
              <a href="/services/data-services" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-003</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Data transfer</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Files, settings, cloning</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>STARTS</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">backed up</div></div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>data first</span>
                </div>
              </a>
              <a href="/services/upgrades" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-004</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Hardware upgrades</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>SSD, RAM, GPU, CPU</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>STARTS</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">same week</div></div>
                  <span className="c04-save-chip">CORE</span>
                </div>
              </a>
              <a href="/services/os-installation" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-005</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>OS installation</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Windows or Linux, license incl.</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>STARTS</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">same week</div></div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>dual-boot OK</span>
                </div>
              </a>
              <a href="/services/custom-computers" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-006</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Custom builds</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Free lifetime diagnostics</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>BUILT</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">in Topeka</div></div>
                  <span className="c04-save-chip">FEATURED</span>
                </div>
              </a>
              <a href="/services/recycling" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>SVC-007</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>Free recycling</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>Data destruction included</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.45)', fontSize: 10 }}>COST</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">FREE</div></div>
                  <span className="c04-save-chip">PUBLIC</span>
                </div>
              </a>
              <a href="/contact" className="c04-card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', borderColor: '#2563eb' }}>
                <div className="c04-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>HOUSE CALL</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', marginTop: 4 }}>We come to you</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 4 }}>On-site visits, now booking</div>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
                  <div><div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.7)', fontSize: 10 }}>SCHEDULE</div><div style={{ fontSize: 22, fontWeight: 900 }} className="c04-num">today</div></div>
                  <span className="c04-red-chip">[*] HOT</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* WHY CSK */}
        <section id="why" style={{ background: '#0f1115', borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <div className="c04-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c04-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <div className="c04-photo c04-ph-floor" style={{ width: '100%', aspectRatio: '4 / 5' }}></div>
              </div>
              <div style={{ gridColumn: 'span 12 / span 12', marginTop: 48 }}>
                <span className="c04-smcaps" style={{ color: '#3b82f6' }}>Why CSK</span>
                <h2 className="c04-display" style={{ fontSize: 52, marginTop: 12, marginBottom: 0 }}>
                  Big-box selection.<br />
                  <span style={{ color: '#3b82f6' }}>Local bench.</span><br />
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Honest answers.</span>
                </h2>

                <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', columnGap: 40, rowGap: 28 }}>
                  <div>
                    <div className="c04-display c04-num" style={{ fontSize: 64, lineHeight: 1, color: '#ffd700' }}>22</div>
                    <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.55)', marginTop: 4 }}>years locally owned</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 8 }}>Same shop, same community, never sold to a chain.</p>
                  </div>
                  <div>
                    <div className="c04-display c04-num" style={{ fontSize: 64, lineHeight: 1, color: '#ffd700' }}>2003</div>
                    <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.55)', marginTop: 4 }}>established by jim driggers</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 8 }}>Now owned by Max Beyer. Same standards, more services.</p>
                  </div>
                  <div>
                    <div className="c04-display c04-num" style={{ fontSize: 64, lineHeight: 1, color: '#ffd700' }}>1,000+</div>
                    <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.55)', marginTop: 4 }}>satisfied customers</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 8 }}>People keep coming back. That is the whole metric.</p>
                  </div>
                  <div>
                    <div className="c04-display c04-num" style={{ fontSize: 64, lineHeight: 1, color: '#ffd700' }}>FREE</div>
                    <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.55)', marginTop: 4 }}>electronics recycling</div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 8 }}>Old computers, TVs, radios, consoles. Data destruction included.</p>
                  </div>
                </div>

                <div style={{ marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href="#shop" className="c04-btn-blue">SHOP COMPUTERS &rarr;</a>
                  <a href="/contact" className="c04-btn-ghost">SCHEDULE A DIAGNOSTIC</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #0c1430 100%)' }}>
          <div className="c04-wrap" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="c04-grid" style={{ alignItems: 'center' }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <span className="c04-smcaps" style={{ color: '#dbeafe' }}>House calls now booking . open through 6 PM</span>
                <h2 className="c04-display" style={{ fontSize: 56, marginTop: 12, marginBottom: 0 }}>
                  Drop by today.<br />
                  <span style={{ color: 'rgba(255,255,255,.65)' }}>Or we will come to you.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 18, color: 'rgba(255,255,255,.85)', maxWidth: '50ch' }}>
                  Open till 6 PM Monday through Friday and till 2 PM on Saturday. Free parking. Walk-ins welcome.
                  Or schedule an on-site visit and our tech will come to your home or business.
                </p>
                <div style={{ marginTop: 36, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <a href="/contact" className="c04-btn-pri">GET DIRECTIONS &rarr;</a>
                  <a href="tel:7852673223" className="c04-btn-ghost">(785) 267-3223</a>
                </div>
              </div>
              <aside style={{ gridColumn: 'span 12 / span 12', marginTop: 48 }}>
                <div style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.15)', padding: 24 }}>
                  <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.6)', marginBottom: 12 }}>The shop</div>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>2008 SW Gage Blvd</div>
                  <div style={{ color: 'rgba(255,255,255,.7)' }}>Topeka, KS 66604</div>

                  <div className="c04-hr" style={{ margin: '20px 0' }}></div>

                  <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.6)', marginBottom: 8 }}>Today\'s hours</div>
                  <div className="c04-mono" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 4, fontSize: 13.5 }}>
                    <span style={{ color: 'rgba(255,255,255,.55)' }}>MON-FRI</span><span>10 AM - 6 PM</span>
                    <span style={{ color: 'rgba(255,255,255,.55)' }}>SAT</span><span>10 AM - 2 PM</span>
                    <span style={{ color: 'rgba(255,255,255,.55)' }}>SUN</span><span style={{ color: 'rgba(255,255,255,.45)' }}>closed</span>
                  </div>

                  <div className="c04-hr" style={{ margin: '20px 0' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span> Open now . house calls available
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#000', color: 'rgba(255,255,255,.8)', borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <div className="c04-wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <div className="c04-grid" style={{ fontSize: 13.5 }}>
              <div style={{ gridColumn: 'span 12 / span 12' }}>
                <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" style={{ height: 36, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                <p style={{ marginTop: 16, color: 'rgba(255,255,255,.55)', maxWidth: 384 }}>Independent computer sales and repair in Topeka, Kansas. Locally owned since 2003 by Jim Driggers, now Max Beyer.</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 20, fontSize: 12, fontWeight: 700 }}>
                  <span style={{ border: '1px solid rgba(255,255,255,.2)', padding: '6px 10px' }}>NON-COMMISSIONED</span>
                  <span style={{ border: '1px solid rgba(255,255,255,.2)', padding: '6px 10px' }}>22 YEARS</span>
                  <span style={{ border: '1px solid rgba(255,255,255,.2)', padding: '6px 10px' }}>HOUSE CALLS</span>
                </div>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Shop</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', rowGap: 6 }}>
                  <li>Custom PCs</li><li>New laptops</li><li>Refurbished desktops</li><li>Printers</li><li>Protection plans</li>
                </ul>
              </div>
              <div style={{ gridColumn: 'span 6 / span 6', marginTop: 32 }}>
                <div className="c04-smcaps" style={{ color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>Services</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', rowGap: 6 }}>
                  <li>Diagnostics</li><li>Virus removal</li><li>Data services</li><li>Upgrades</li><li>OS installs</li><li>Free recycling</li>
                </ul>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <div className="c04-wrap" style={{ paddingTop: 20, paddingBottom: 20, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
              <div>(C) 2026 COMPUTER STORE KANSAS . 2008 SW GAGE BLVD, TOPEKA KS</div>
              <div>Inter . DM Mono</div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
