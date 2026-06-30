'use client';

/**
 * Concept 05 — "Circuitry" homepage redesign (client component).
 *
 * Adapted from the Homepage Redesign mock (redesign.css + colors_and_type.css).
 * All styling is inlined and scoped under `.c05-root` so it cannot leak into the
 * rest of the app. Icons come from lucide-react (the mock used the lucide CDN);
 * the three vanilla-JS behaviors from the mock (sticky-header shadow, mobile
 * menu, reveal-on-scroll) are reproduced with a single useEffect.
 *
 * Business facts (phone, hours, address, founding year, rating, reviews) are the
 * real values from lib/constants + the Google reviews fallback set.
 */
import { useEffect } from 'react';
import {
  CalendarCheck, Menu, Monitor, MapPin, Truck, ShieldCheck, Wrench, Cpu,
  HardDrive, House, Terminal, ArrowRight, BadgeDollarSign, MessagesSquare,
  Award, Laptop, Check, Star, Phone,
} from 'lucide-react';
import { FLOOR_SVG } from './floor-svg';

const PHONE_TEL = '7852673223';
const PHONE_FMT = '(785) 267-3223';

/** Real Google reviews (fallback set used across the live site) — all 5★. */
const REVIEWS = [
  { name: 'Kristina Jones', text: "Signing up for a Computer Protection Plan from The Computer Store was the best decision I've made in years. My computer has never run better!" },
  { name: 'Matt Thompson', text: 'Not only did The Computer Store fix my problem a lot faster than the big box store, they did so at just under half the cost. Highly recommend!' },
  { name: 'Andrew Davis', text: 'The technician managed to recover all my data from a failed hard drive. Saved me a lot of headache and money — thank you Computer Store!' },
  { name: 'Sarah Mitchell', text: 'Excellent service! They fixed my laptop the same day I brought it in. Very professional and reasonably priced.' },
  { name: 'David Kim', text: 'Quick turnaround on my desktop repair. Fair prices and friendly staff. Will definitely come back.' },
  { name: 'Jennifer Roberts', text: "The team really knows their stuff. Fixed a virus issue that another shop couldn't figure out. Great local business!" },
];

const STYLES = `
.c05-root{
  --font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --primary-50:#eff6ff;--primary-100:#dbeafe;--primary-200:#bfdbfe;--primary-300:#93c5fd;
  --primary-400:#60a5fa;--primary-500:#3b82f6;--primary-600:#2563eb;--primary-700:#1d4ed8;
  --primary-800:#1e40af;--primary-900:#1e3a8a;--primary-950:#172554;
  --silver:#c0c0c0;--silver-light:#e8e8e8;--silver-mid:#d4d4d4;--silver-dark:#a0a0a0;--silver-text:#2a2a2a;
  --gradient-silver:linear-gradient(135deg,#e8e8e8 0%,#b8b8b8 25%,#d4d4d4 50%,#a0a0a0 75%,#c8c8c8 100%);
  --gradient-platinum:linear-gradient(135deg,#f9fafb 0%,#d1d5db 25%,#f3f4f6 50%,#c8c8c8 75%,#e5e7eb 100%);
  --gold:#ffd700;--gold-deep:#daa520;--gold-dark:#b8860b;
  --gradient-gold:linear-gradient(135deg,#ffd700 0%,#b8860b 100%);
  --gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;--gray-300:#d1d5db;--gray-400:#9ca3af;
  --gray-500:#6b7280;--gray-600:#4b5563;--gray-700:#374151;--gray-800:#1f2937;--gray-900:#111827;--gray-950:#030712;
  --success:#10b981;
  --bg-light:#f8f9fb;--bg-dark:#f0f2f5;
  --radius-brand-sm:8px;--radius-brand-md:12px;--radius-brand-lg:16px;--radius-brand-xl:24px;--radius-full:9999px;
  --shadow-brand-sm:0 1px 3px rgba(15,23,42,.08),0 1px 2px rgba(15,23,42,.06);
  --shadow-brand-md:0 4px 20px rgba(0,0,0,.10);
  --shadow-brand-lg:0 12px 40px rgba(15,23,42,.14);
  --shadow-header:0 2px 12px rgba(15,23,42,.06);
  --shadow-header-scrolled:0 6px 24px rgba(15,23,42,.12);
  --glow-blue:0 0 0 4px rgba(37,99,235,.18);
  --glow-gold:0 4px 20px rgba(255,215,0,.30);
  --glow-silver:0 4px 15px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.6),inset 0 -1px 0 rgba(0,0,0,.10);
  --duration-fast:150ms;--duration-normal:300ms;
  --ease-out:cubic-bezier(.16,1,.3,1);--ease-standard:cubic-bezier(.4,0,.2,1);
  font-family:var(--font-sans);color:var(--gray-900);background:var(--bg-light);
  line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;scroll-behavior:smooth;
}
.c05-root *,.c05-root *::before,.c05-root *::after{box-sizing:border-box;}
.c05-root img,.c05-root svg{display:block;max-width:100%;}
.c05-root a{color:inherit;text-decoration:none;}
.c05-root ul{margin:0;padding:0;list-style:none;}
.c05-root h1,.c05-root h2,.c05-root h3,.c05-root h4{margin:0;}
.c05-root .csk-gold-text{color:var(--gold-dark);background:var(--gradient-gold);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

.c05-root .wrap{width:100%;max-width:1140px;margin-inline:auto;padding-inline:20px;}
@media (min-width:768px){.c05-root .wrap{padding-inline:32px;}}
.c05-root .eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--primary-600);}
.c05-root .eyebrow::before{content:"";width:22px;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--primary-600),transparent);}
.c05-root .eyebrow--light{color:var(--primary-300);}
.c05-root .eyebrow--light::before{background:linear-gradient(90deg,var(--primary-400),transparent);}
.c05-root .section{padding-block:64px;position:relative;}
@media (min-width:768px){.c05-root .section{padding-block:96px;}}
.c05-root .section__head{max-width:640px;margin-bottom:36px;}
.c05-root .section__title{font-size:clamp(1.8rem,1.3rem + 2.4vw,2.9rem);font-weight:800;letter-spacing:-.02em;line-height:1.08;}
.c05-root .section__sub{margin-top:14px;color:var(--gray-600);font-size:1.05rem;line-height:1.6;}
.c05-root .text-grad{background:linear-gradient(120deg,var(--primary-500),var(--primary-700) 60%,var(--primary-900));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}

.c05-root .btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font:inherit;font-weight:650;font-size:1rem;cursor:pointer;padding:14px 24px;border-radius:var(--radius-brand-md);border:1px solid transparent;transition:transform var(--duration-fast) var(--ease-out),box-shadow var(--duration-normal) var(--ease-out),background var(--duration-fast) var(--ease-out);white-space:nowrap;}
.c05-root .btn svg{width:18px;height:18px;}
.c05-root .btn--primary{color:#fff;background:linear-gradient(135deg,var(--primary-500),var(--primary-700));box-shadow:0 6px 18px rgba(37,99,235,.32);}
.c05-root .btn--primary:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(37,99,235,.45),var(--glow-blue);}
.c05-root .btn--primary:active{transform:translateY(0) scale(.99);}
.c05-root .btn--ghost{color:var(--primary-200);background:rgba(255,255,255,.04);border-color:rgba(147,197,253,.30);backdrop-filter:blur(6px);}
.c05-root .btn--ghost:hover{background:rgba(255,255,255,.10);border-color:var(--primary-300);transform:translateY(-2px);}
.c05-root .btn--dark{color:var(--gray-800);background:#fff;border-color:var(--gray-200);box-shadow:var(--shadow-brand-sm);}
.c05-root .btn--dark:hover{transform:translateY(-2px);box-shadow:var(--shadow-brand-md);border-color:var(--primary-300);color:var(--primary-700);}
.c05-root .btn--block{width:100%;}

.c05-root .site-header{position:fixed;inset:0 0 auto 0;z-index:1000;padding:14px;}
.c05-root .site-header__bar{display:flex;align-items:center;justify-content:space-between;max-width:1140px;margin-inline:auto;padding:10px 16px;background:rgba(255,255,255,.78);border:1px solid rgba(147,197,253,.35);border-radius:var(--radius-brand-lg);backdrop-filter:blur(14px) saturate(1.3);box-shadow:var(--shadow-header);transition:box-shadow var(--duration-normal),background var(--duration-normal);}
.c05-root .site-header.is-scrolled .site-header__bar{box-shadow:var(--shadow-header-scrolled);background:rgba(255,255,255,.92);}
.c05-root .site-header__logo img{height:38px;width:auto;}
.c05-root .site-nav{display:none;}
@media (min-width:900px){
  .c05-root .site-nav{display:flex;align-items:center;gap:4px;}
  .c05-root .site-nav a{padding:9px 14px;border-radius:var(--radius-brand-sm);font-weight:550;color:var(--gray-700);transition:all var(--duration-fast);}
  .c05-root .site-nav a:hover{color:var(--primary-700);background:var(--primary-50);}
  .c05-root .site-nav .btn{padding:10px 18px;margin-left:8px;}
}
.c05-root .nav-toggle{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border:none;background:transparent;cursor:pointer;color:var(--gray-800);border-radius:var(--radius-brand-sm);}
.c05-root .nav-toggle:hover{background:var(--primary-50);}
.c05-root .nav-toggle svg{width:26px;height:26px;}
@media (min-width:900px){.c05-root .nav-toggle{display:none;}}
.c05-root .mobile-menu{position:fixed;inset:80px 14px auto 14px;z-index:999;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-brand-lg);box-shadow:var(--shadow-brand-lg);padding:10px;transform-origin:top;opacity:0;transform:translateY(-10px) scaleY(.96);pointer-events:none;transition:opacity var(--duration-fast),transform var(--duration-fast);}
.c05-root .mobile-menu.is-open{opacity:1;transform:none;pointer-events:auto;}
.c05-root .mobile-menu a{display:block;padding:14px 16px;border-radius:var(--radius-brand-sm);font-weight:600;color:var(--gray-800);}
.c05-root .mobile-menu a:hover{background:var(--primary-50);color:var(--primary-700);}
.c05-root .mobile-menu .btn{margin-top:6px;}
@media (min-width:900px){.c05-root .mobile-menu{display:none;}}

.c05-root .hero{position:relative;isolation:isolate;overflow:hidden;background:radial-gradient(120% 90% at 50% -10%,#16306b 0%,rgba(22,48,107,0) 55%),linear-gradient(180deg,#0a1530 0%,#0a1024 55%,#0b1228 100%);color:#fff;padding-top:120px;padding-bottom:80px;}
@media (min-width:768px){.c05-root .hero{padding-top:160px;padding-bottom:120px;}}
.c05-root .hero__floor{position:absolute;left:50%;bottom:-8%;z-index:0;width:240%;height:70%;translate:-50% 0;transform:perspective(680px) rotateX(74deg);transform-origin:50% 100%;color:var(--primary-400);-webkit-mask-image:radial-gradient(120% 100% at 50% 100%,#000 18%,rgba(0,0,0,.5) 45%,transparent 72%);mask-image:radial-gradient(120% 100% at 50% 100%,#000 18%,rgba(0,0,0,.5) 45%,transparent 72%);opacity:.55;}
.c05-root .hero__floor svg{width:100%;height:100%;filter:drop-shadow(0 0 6px rgba(59,130,246,.55));}
.c05-root .hero__floor .pulse{stroke:#bfdbfe;stroke-width:2.6;filter:drop-shadow(0 0 5px #60a5fa);stroke-dasharray:36 240;stroke-dashoffset:0;animation:c05trace 4.5s linear infinite;animation-delay:var(--d,0s);}
@keyframes c05trace{to{stroke-dashoffset:-276;}}
.c05-root .hero__floor .vglow{animation:c05via 3.4s ease-in-out infinite;}
@keyframes c05via{0%,100%{opacity:.5;}50%{opacity:1;}}
@media (min-width:768px){.c05-root .hero__floor{width:150%;height:78%;}}
.c05-root .hero__mark{position:absolute;z-index:0;top:9%;right:-54px;width:220px;pointer-events:none;}
.c05-root .hero__mark img{width:100%;filter:brightness(1.15) saturate(1.12) drop-shadow(0 0 26px rgba(96,165,250,.55)) drop-shadow(0 0 9px rgba(147,197,253,.5));opacity:.55;animation:c05mark 7s var(--ease-standard) infinite;}
@media (min-width:768px){.c05-root .hero__mark{right:3%;top:14%;width:440px;}.c05-root .hero__mark img{opacity:.92;}}
@keyframes c05mark{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
.c05-root .hero__motes{position:absolute;inset:0;z-index:0;pointer-events:none;}
.c05-root .mote{position:absolute;border-radius:50%;background:radial-gradient(circle,#93c5fd 0%,rgba(59,130,246,0) 70%);}
.c05-root .mote.is-glow{box-shadow:0 0 10px 2px rgba(96,165,250,.6);background:#bfdbfe;}
.c05-root .hero__inner{position:relative;z-index:2;}
.c05-root .hero__badge{display:inline-flex;align-items:center;gap:8px;margin-bottom:22px;padding:7px 14px 7px 10px;border-radius:var(--radius-full);background:rgba(59,130,246,.12);border:1px solid rgba(96,165,250,.35);font-size:.82rem;font-weight:600;color:var(--primary-100);backdrop-filter:blur(6px);}
.c05-root .hero__badge .dot{width:8px;height:8px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399;}
.c05-root .hero__title{font-size:clamp(2.4rem,1.3rem + 6vw,4.6rem);font-weight:850;line-height:1.03;letter-spacing:-.025em;max-width:14ch;}
.c05-root .hero__title .accent{background:linear-gradient(110deg,#60a5fa,#c0c0c0 70%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
.c05-root .hero__lead{margin-top:20px;max-width:52ch;font-size:1.1rem;line-height:1.6;color:#c7d2e8;}
.c05-root .hero__cta{display:flex;flex-direction:column;gap:12px;margin-top:30px;}
@media (min-width:560px){.c05-root .hero__cta{flex-direction:row;flex-wrap:wrap;}}
.c05-root .hero__trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:34px;font-size:.9rem;color:#aebbd6;}
.c05-root .hero__trust span{display:inline-flex;align-items:center;gap:7px;}
.c05-root .hero__trust svg{width:17px;height:17px;color:var(--primary-300);}

.c05-root .stats{position:relative;z-index:3;margin-top:-36px;}
.c05-root .stats__grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--gray-200);border:1px solid var(--gray-200);border-radius:var(--radius-brand-lg);overflow:hidden;box-shadow:var(--shadow-brand-md);}
@media (min-width:768px){.c05-root .stats__grid{grid-template-columns:repeat(4,1fr);}}
.c05-root .stat{background:#fff;padding:22px 18px;text-align:center;}
.c05-root .stat__num{font-size:clamp(1.6rem,1.2rem + 1.6vw,2.3rem);font-weight:800;color:var(--primary-700);letter-spacing:-.02em;}
.c05-root .stat__label{margin-top:4px;font-size:.82rem;color:var(--gray-500);font-weight:500;}

.c05-root .svc-grid{display:grid;grid-template-columns:1fr;gap:16px;}
@media (min-width:600px){.c05-root .svc-grid{grid-template-columns:repeat(2,1fr);}}
@media (min-width:980px){.c05-root .svc-grid{grid-template-columns:repeat(3,1fr);}}
.c05-root .svc-card{position:relative;overflow:hidden;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-brand-lg);padding:26px 22px 24px;transition:transform var(--duration-normal) var(--ease-out),box-shadow var(--duration-normal),border-color var(--duration-normal);}
.c05-root .svc-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(37,99,235,.16);border-color:rgba(59,130,246,.4);}
.c05-root .svc-card__circ{position:absolute;top:-20px;right:-20px;width:130px;height:130px;opacity:.07;transition:opacity var(--duration-normal);pointer-events:none;}
.c05-root .svc-card:hover .svc-card__circ{opacity:.18;}
.c05-root .svc-icon{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:var(--radius-brand-md);background:linear-gradient(135deg,var(--primary-50),#fff);border:1px solid var(--primary-100);color:var(--primary-600);margin-bottom:16px;position:relative;z-index:1;}
.c05-root .svc-icon svg{width:26px;height:26px;}
.c05-root .svc-card h3{font-size:1.2rem;font-weight:700;position:relative;z-index:1;}
.c05-root .svc-card p{margin:8px 0 0;color:var(--gray-600);font-size:.95rem;line-height:1.55;position:relative;z-index:1;}
.c05-root .svc-card__link{display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-weight:650;font-size:.9rem;color:var(--primary-600);position:relative;z-index:1;}
.c05-root .svc-card__link svg{width:16px;height:16px;transition:transform var(--duration-fast);}
.c05-root .svc-card:hover .svc-card__link svg{transform:translateX(4px);}

.c05-root .band{position:relative;overflow:hidden;color:#fff;background:linear-gradient(160deg,#0c1730 0%,#0a1126 100%);}
.c05-root .band .section__title{color:#fff;}
.c05-root .band .section__sub{color:#b8c4de;}
.c05-root .feat-grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:8px;}
@media (min-width:768px){.c05-root .feat-grid{grid-template-columns:repeat(2,1fr);gap:18px;}}
.c05-root .feat{display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:var(--radius-brand-lg);background:rgba(255,255,255,.04);border:1px solid rgba(147,197,253,.18);backdrop-filter:blur(4px);}
.c05-root .feat__icon{flex-shrink:0;width:46px;height:46px;border-radius:var(--radius-brand-md);display:inline-flex;align-items:center;justify-content:center;background:rgba(59,130,246,.16);border:1px solid rgba(96,165,250,.35);color:var(--primary-300);}
.c05-root .feat__icon svg{width:24px;height:24px;}
.c05-root .feat h3{font-size:1.08rem;font-weight:700;}
.c05-root .feat p{margin:6px 0 0;color:#b3c0db;font-size:.92rem;line-height:1.5;}

.c05-root .plan-grid{display:grid;grid-template-columns:1fr;gap:20px;}
@media (min-width:880px){.c05-root .plan-grid{grid-template-columns:repeat(3,1fr);align-items:start;}}
.c05-root .plan{position:relative;background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-brand-lg);padding:28px 24px;display:flex;flex-direction:column;box-shadow:var(--shadow-brand-md);}
.c05-root .plan--silver{border:2px solid var(--silver-dark);}
.c05-root .plan--plus{border:2px solid transparent;box-shadow:var(--glow-gold);}
@media (min-width:880px){.c05-root .plan--plus{transform:translateY(-12px);}}
.c05-root .plan__flag{position:absolute;top:-12px;right:20px;padding:5px 14px;border-radius:var(--radius-full);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#fff;}
.c05-root .plan__flag--pop{background:var(--success);}
.c05-root .plan__flag--biz{background:var(--gradient-gold);}
.c05-root .plan__flag--top{background:linear-gradient(135deg,#e5e7eb,#9ca3af);color:var(--gray-700);}
.c05-root .plan__badge{align-self:center;padding:9px 26px;border-radius:var(--radius-brand-sm);font-size:1.5rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--silver-text);background-image:var(--gradient-silver);background-size:300% 300%;text-shadow:1px 1px 2px rgba(255,255,255,.9),-1px -1px 1px rgba(0,0,0,.15);box-shadow:var(--glow-silver);border:2px solid var(--silver-dark);animation:c05silver 6s ease infinite;}
.c05-root .plan--plus .plan__badge{border-color:var(--gold-dark);}
.c05-root .plan--top .plan__badge{background-image:var(--gradient-platinum);border-color:var(--gray-300);}
@keyframes c05silver{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
.c05-root .plan__price{text-align:center;margin:20px 0 16px;padding-bottom:18px;border-bottom:1px solid var(--gray-200);}
.c05-root .plan__price .amt{font-size:2.4rem;font-weight:800;color:var(--gray-800);letter-spacing:-.02em;}
.c05-root .plan--plus .plan__price .amt{color:var(--gold-dark);}
.c05-root .plan__price .per{font-size:.95rem;color:var(--gray-500);}
.c05-root .plan__price .note{display:block;font-size:.82rem;color:var(--gray-500);margin-top:6px;}
.c05-root .plan ul{display:flex;flex-direction:column;gap:10px;margin:4px 0 22px;flex-grow:1;}
.c05-root .plan li{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;color:var(--gray-700);}
.c05-root .plan li svg{width:18px;height:18px;flex-shrink:0;color:var(--success);margin-top:1px;}
.c05-root .plan li.star svg{color:var(--gold);}
.c05-root .plan li.star{color:var(--gold-dark);font-weight:550;}
.c05-root .plan__cont{font-weight:700;color:var(--gray-800);font-size:.9rem;margin:2px 0 10px;}
.c05-root .plans-section{position:relative;overflow:hidden;background:var(--bg-dark);}
.c05-root .plans-section > .wrap{position:relative;z-index:1;}

.c05-root .rev-head{display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;margin-bottom:32px;}
.c05-root .star-rate{position:relative;display:inline-block;color:var(--gray-300);letter-spacing:2px;line-height:1;white-space:nowrap;}
.c05-root .star-rate::before{content:"★★★★★";}
.c05-root .star-rate__fill{position:absolute;inset:0;overflow:hidden;color:var(--gold);}
.c05-root .star-rate__fill::before{content:"★★★★★";}
.c05-root .rev-head .score{font-size:3rem;font-weight:800;color:var(--gray-900);line-height:1;}
.c05-root .rev-head .meta{color:var(--gray-500);font-size:.95rem;}
.c05-root .rev-grid{display:grid;grid-template-columns:1fr;gap:16px;}
@media (min-width:700px){.c05-root .rev-grid{grid-template-columns:repeat(2,1fr);}}
@media (min-width:1000px){.c05-root .rev-grid{grid-template-columns:repeat(3,1fr);}}
.c05-root .rev{background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-brand-md);padding:22px;transition:box-shadow var(--duration-normal),transform var(--duration-normal);}
.c05-root .rev:hover{box-shadow:var(--shadow-brand-md);transform:translateY(-3px);}
.c05-root .rev__top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.c05-root .rev__avatar{width:42px;height:42px;border-radius:50%;flex-shrink:0;background:var(--primary-600);color:#fff;font-weight:700;font-size:1.1rem;display:inline-flex;align-items:center;justify-content:center;}
.c05-root .rev__name{font-weight:650;color:var(--gray-900);font-size:.95rem;}
.c05-root .rev__date{font-size:.8rem;color:var(--gray-500);}
.c05-root .rev__stars{color:var(--gold);font-size:.95rem;margin-left:auto;}
.c05-root .rev p{margin:0;color:var(--gray-700);font-size:.93rem;line-height:1.6;}

.c05-root .cta{position:relative;overflow:hidden;text-align:center;color:#fff;background:radial-gradient(120% 120% at 50% 0%,#1b3a78 0%,#0b1228 60%);}
.c05-root .cta h2{font-size:clamp(2rem,1.4rem + 3vw,3.2rem);font-weight:850;letter-spacing:-.02em;position:relative;}
.c05-root .cta p{margin:16px auto 0;max-width:46ch;color:#c7d2e8;font-size:1.08rem;position:relative;}
.c05-root .cta__btns{display:flex;flex-direction:column;gap:12px;margin-top:28px;justify-content:center;position:relative;}
@media (min-width:560px){.c05-root .cta__btns{flex-direction:row;}}

.c05-root .site-footer{background:var(--gray-900);color:#fff;padding:56px 0 36px;position:relative;overflow:hidden;}
.c05-root .footer-grid{position:relative;display:grid;grid-template-columns:1fr;gap:32px;}
@media (min-width:760px){.c05-root .footer-grid{grid-template-columns:1.4fr 1fr 1fr;}}
.c05-root .footer-brand img{height:40px;margin-bottom:14px;filter:brightness(0) invert(1);}
.c05-root .footer-brand p{color:#9fb0cf;font-size:.92rem;line-height:1.6;max-width:34ch;}
.c05-root .footer-col h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.12em;color:var(--silver);margin-bottom:14px;}
.c05-root .footer-col a,.c05-root .footer-loc p{color:#b9c5dd;font-size:.92rem;line-height:1.9;}
.c05-root .footer-col a:hover{color:var(--primary-300);}
.c05-root .footer-loc{margin-bottom:16px;}
.c05-root .footer-loc strong{color:#fff;display:block;font-size:.9rem;}
.c05-root .footer-loc a{color:var(--primary-400);}
.c05-root .footer-bottom{position:relative;margin-top:36px;padding-top:22px;border-top:1px solid rgba(255,255,255,.12);display:flex;flex-direction:column;gap:8px;align-items:center;text-align:center;color:#8b9bbb;font-size:.85rem;}
@media (min-width:700px){.c05-root .footer-bottom{flex-direction:row;justify-content:space-between;text-align:left;}}

.c05-root .band__circ{position:absolute;inset:0;opacity:.12;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent);mask-image:linear-gradient(180deg,transparent,#000 30%,#000 70%,transparent);}
.c05-root .band__circ img{width:100%;height:100%;object-fit:cover;}
.c05-root .plans__circ{position:absolute;inset:0;z-index:0;opacity:.08;pointer-events:none;-webkit-mask-image:radial-gradient(120% 90% at 50% 0%,#000 35%,transparent 78%);mask-image:radial-gradient(120% 90% at 50% 0%,#000 35%,transparent 78%);}
.c05-root .plans__circ img{width:100%;height:100%;object-fit:cover;}
.c05-root .cta__circ{position:absolute;inset:0;opacity:.16;pointer-events:none;-webkit-mask-image:radial-gradient(120% 120% at 50% 0%,#000 40%,transparent 80%);mask-image:radial-gradient(120% 120% at 50% 0%,#000 40%,transparent 80%);}
.c05-root .cta__circ img{width:100%;height:100%;object-fit:cover;}
.c05-root .site-footer__circ{position:absolute;inset:0;opacity:.08;pointer-events:none;}
.c05-root .site-footer__circ img{width:100%;height:100%;object-fit:cover;}
.c05-root .reveal{opacity:0;transform:translateY(22px);transition:opacity .7s var(--ease-out),transform .7s var(--ease-out);}
.c05-root .reveal.is-in{opacity:1;transform:none;}
@media (prefers-reduced-motion:reduce){.c05-root .reveal{opacity:1;transform:none;transition:none;}.c05-root .hero__floor,.c05-root .plan__badge{animation:none;}}

.c05-root .callbar{position:fixed;inset:auto 0 0 0;z-index:900;display:flex;gap:10px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.92);border-top:1px solid var(--gray-200);backdrop-filter:blur(12px);}
.c05-root .callbar .btn{flex:1;padding:13px;}
@media (min-width:900px){.c05-root .callbar{display:none;}}
@media (max-width:899px){.c05-root{padding-bottom:72px;}}

.c05-ribbon{position:fixed;left:14px;bottom:14px;z-index:2000;display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:9999px;background:rgba(11,18,40,.92);color:#dbeafe;font:600 12px var(--font-sans);border:1px solid rgba(96,165,250,.4);box-shadow:0 6px 20px rgba(0,0,0,.3);backdrop-filter:blur(8px);}
.c05-ribbon b{color:#fff;}
@media (max-width:899px){.c05-ribbon{display:none;}}
`;

export default function Concept05() {
  useEffect(() => {
    const header = document.getElementById('c05Header');
    const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = document.getElementById('c05NavToggle');
    const menu = document.getElementById('c05MobileMenu');
    const onToggle = () => {
      const open = menu?.classList.toggle('is-open');
      toggle?.setAttribute('aria-expanded', String(!!open));
    };
    toggle?.addEventListener('click', onToggle);
    const linkHandlers: Array<() => void> = [];
    menu?.querySelectorAll('a').forEach((a) => {
      const close = () => { menu.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); };
      a.addEventListener('click', close);
      linkHandlers.push(() => a.removeEventListener('click', close));
    });

    const reveals = Array.from(document.querySelectorAll('.c05-root .reveal'));
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('is-in'); io?.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach((el) => io?.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('is-in'));
    }
    const safety = window.setTimeout(() => reveals.forEach((el) => el.classList.add('is-in')), 3000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      toggle?.removeEventListener('click', onToggle);
      linkHandlers.forEach((off) => off());
      io?.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <div className="c05-root">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <span className="c05-ribbon">Concept 05 — <b>Circuitry</b></span>

      <header className="site-header" id="c05Header">
        <div className="site-header__bar">
          <a className="site-header__logo" href="#top" aria-label="Computer Store KS home">
            <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" />
          </a>
          <nav className="site-nav">
            <a href="#services">Services</a>
            <a href="#plans">Protection Plans</a>
            <a href="#computers">Computers</a>
            <a href="#reviews">Reviews</a>
            <a className="btn btn--primary" href="/contact"><CalendarCheck /> Book a repair</a>
          </nav>
          <button className="nav-toggle" id="c05NavToggle" aria-label="Open menu" aria-expanded="false"><Menu /></button>
        </div>
      </header>
      <div className="mobile-menu" id="c05MobileMenu">
        <a href="#services">Services</a>
        <a href="#plans">Protection Plans</a>
        <a href="#computers">Computers</a>
        <a href="#reviews">Reviews</a>
        <a className="btn btn--primary btn--block" href="/contact"><CalendarCheck /> Book a repair</a>
      </div>

      <main id="top">
        <section className="hero">
          <div className="hero__floor" dangerouslySetInnerHTML={{ __html: FLOOR_SVG }} />
          <div className="hero__mark"><img src="/assets/csk-icon.svg" alt="" /></div>
          <div className="hero__motes">
            <span className="mote" style={{ left: '12%', top: '28%', width: 10, height: 10 }} />
            <span className="mote is-glow" style={{ left: '78%', top: '20%', width: 7, height: 7 }} />
            <span className="mote" style={{ left: '40%', top: '16%', width: 6, height: 6 }} />
            <span className="mote" style={{ left: '88%', top: '44%', width: 12, height: 12 }} />
            <span className="mote is-glow" style={{ left: '22%', top: '52%', width: 8, height: 8 }} />
            <span className="mote" style={{ left: '63%', top: '60%', width: 9, height: 9 }} />
            <span className="mote" style={{ left: '8%', top: '68%', width: 6, height: 6 }} />
            <span className="mote is-glow" style={{ left: '92%', top: '72%', width: 7, height: 7 }} />
          </div>
          <div className="wrap hero__inner">
            <span className="hero__badge"><span className="dot" /> Locally owned in Topeka, KS</span>
            <h1 className="hero__title">Topeka&rsquo;s <span className="accent">computer experts.</span></h1>
            <p className="hero__lead">From virus removal to custom builds, our bench has kept Kansas running for over two decades. Walk in during business hours &mdash; or we&rsquo;ll come to you.</p>
            <div className="hero__cta">
              <a className="btn btn--primary" href="/contact"><CalendarCheck /> Book a repair</a>
              <a className="btn btn--ghost" href="#computers"><Monitor /> Browse in-store PCs</a>
            </div>
            <div className="hero__trust">
              <span><span className="star-rate" style={{ fontSize: '0.95rem' }}><span className="star-rate__fill" style={{ width: '100%' }} /></span> 5.0 Google rating</span>
              <span><MapPin /> Serving Topeka since 2003</span>
              <span><Truck /> House calls available</span>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="At a glance">
          <div className="wrap">
            <div className="stats__grid">
              <div className="stat"><div className="stat__num">20+</div><div className="stat__label">Years in Topeka</div></div>
              <div className="stat"><div className="stat__num">5.0&#9733;</div><div className="stat__label">Google rating</div></div>
              <div className="stat"><div className="stat__num">12</div><div className="stat__label">Services offered</div></div>
              <div className="stat"><div className="stat__num">Custom</div><div className="stat__label">PC builds &amp; refurbs</div></div>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="wrap">
            <div className="section__head reveal">
              <span className="eyebrow">What we do</span>
              <h2 className="section__title" style={{ marginTop: 12 }}>Repairs, builds, and rescues &mdash; <span className="text-grad">all under one roof.</span></h2>
              <p className="section__sub">A dozen services, one friendly bench. Here are the ones folks ask for most.</p>
            </div>
            <div className="svc-grid">
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><ShieldCheck /></span>
                <h3>Virus &amp; Malware Removal</h3>
                <p>Deep-clean infections and lock your system back down &mdash; plan members save 50% on every removal.</p>
                <a className="svc-card__link" href="/services/virus-removal">Learn more <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Wrench /></span>
                <h3>Repair &amp; Tune-Up</h3>
                <p>Hardware fixes, speed-ups, and straight-talk diagnostics for any laptop or desktop.</p>
                <a className="svc-card__link" href="/services/diagnostics">Learn more <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Cpu /></span>
                <h3>Custom PC Builds</h3>
                <p>Custom desktops and gaming rigs, built and tested in-house to your budget and spec.</p>
                <a className="svc-card__link" href="/services/custom-computers">Learn more <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><HardDrive /></span>
                <h3>Data Recovery</h3>
                <p>Failed drive? We rescue photos, documents, and business files when hardware gives out.</p>
                <a className="svc-card__link" href="/services/data-services">Learn more <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><House /></span>
                <h3>House Calls</h3>
                <p>Can&rsquo;t make it in? We&rsquo;ll come to your home or office &mdash; Silver members get priority.</p>
                <a className="svc-card__link" href="/contact">Learn more <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Terminal /></span>
                <h3>Why Linux?</h3>
                <p>Breathe new life into older hardware with a fast, secure, no-bloat Linux setup.</p>
                <a className="svc-card__link" href="/why-linux">Learn more <ArrowRight /></a>
              </article>
            </div>
          </div>
        </section>

        <section className="band section" id="why">
          <div className="band__circ"><img src="/assets/circuit-field-blue.svg" alt="" /></div>
          <div className="wrap" style={{ position: 'relative' }}>
            <div className="section__head reveal">
              <span className="eyebrow eyebrow--light">Why Computer Store KS</span>
              <h2 className="section__title" style={{ marginTop: 12 }}>Big-shop skill. Small-town straight talk.</h2>
              <p className="section__sub">We&rsquo;re your neighbors, not a call center. That changes how we treat your machine.</p>
            </div>
            <div className="feat-grid">
              <div className="feat reveal">
                <span className="feat__icon"><BadgeDollarSign /></span>
                <div><h3>Honest, upfront pricing</h3><p>No surprise fees. You hear the cost before we touch a screw.</p></div>
              </div>
              <div className="feat reveal">
                <span className="feat__icon"><MessagesSquare /></span>
                <div><h3>Plain-English answers</h3><p>We explain what&rsquo;s wrong in terms that actually make sense &mdash; no jargon, no upsell.</p></div>
              </div>
              <div className="feat reveal">
                <span className="feat__icon"><Award /></span>
                <div><h3>20+ years of trust</h3><p>Topeka has counted on our bench since 2003 &mdash; and kept coming back.</p></div>
              </div>
              <div className="feat reveal">
                <span className="feat__icon"><Truck /></span>
                <div><h3>We come to you</h3><p>House calls for home and business, with priority for plan members.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="computers">
          <div className="wrap">
            <div className="section__head reveal">
              <span className="eyebrow">In-store gallery</span>
              <h2 className="section__title" style={{ marginTop: 12 }}>Custom-built &amp; refurbished PCs, <span className="text-grad">ready to take home.</span></h2>
              <p className="section__sub">Every machine is built, tested, and backed by our bench. Stock changes weekly &mdash; ask about current sales.</p>
            </div>
            <div className="svc-grid">
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Cpu /></span>
                <h3>Gaming Pro Desktop</h3>
                <p>RTX 4060 Ti &middot; Intel i7-12700K &middot; 32GB DDR4 &middot; 1TB NVMe SSD</p>
                <a className="svc-card__link" href="/computers">View build <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Laptop /></span>
                <h3>Refurb Business Laptop</h3>
                <p>15.6&quot; &middot; Intel i5 &middot; 16GB DDR4 &middot; 512GB SSD &middot; 3-mo parts warranty</p>
                <a className="svc-card__link" href="/computers">View build <ArrowRight /></a>
              </article>
              <article className="svc-card reveal">
                <img className="svc-card__circ" src="/assets/circuit-accent-blue.svg" alt="" />
                <span className="svc-icon"><Monitor /></span>
                <h3>Everyday Home Desktop</h3>
                <p>Custom build &middot; Ryzen 5 &middot; 16GB &middot; 1TB SSD &middot; 1-year warranty</p>
                <a className="svc-card__link" href="/computers">View build <ArrowRight /></a>
              </article>
            </div>
          </div>
        </section>

        <section className="section plans-section" id="plans">
          <div className="plans__circ"><img src="/assets/circuit-field-blue.svg" alt="" /></div>
          <div className="wrap">
            <div className="section__head reveal" style={{ marginInline: 'auto', textAlign: 'center' }}>
              <span className="eyebrow" style={{ justifyContent: 'center' }}>Protection plans</span>
              <h2 className="section__title" style={{ marginTop: 12 }}>Keep it running with a Silver plan.</h2>
              <p className="section__sub">Antivirus, discounts, and priority support &mdash; for one flat monthly price per device.</p>
            </div>
            <div className="plan-grid">
              <article className="plan plan--silver reveal">
                <span className="plan__flag plan__flag--pop">Most Popular</span>
                <span className="plan__badge">Silver</span>
                <div className="plan__price"><span className="amt">$24.99</span><span className="per">/device/mo</span><span className="note">3-month minimum &middot; best value for home users, families &amp; remote workers</span></div>
                <ul>
                  <li><Check />Antivirus software included</li>
                  <li><Check />50% discount on virus removal</li>
                  <li><Check />50% off house calls</li>
                  <li><Check />50% off account recovery</li>
                  <li><Check />Remote support (4 hrs/month)</li>
                  <li><Check />Performance monitoring &amp; alerts</li>
                  <li><Check />15% discount on labor</li>
                  <li><Check />Priority scheduling</li>
                </ul>
                <a className="btn btn--dark btn--block" href="/silver-plan">Get started</a>
              </article>
              <article className="plan plan--plus reveal">
                <span className="plan__flag plan__flag--biz">Best for Business</span>
                <span className="plan__badge">Silver <span className="csk-gold-text">Plus</span></span>
                <div className="plan__price"><span className="amt">$34.99</span><span className="per">/device/mo</span><span className="note">3-month minimum &middot; tailored for small businesses &amp; professionals</span></div>
                <p className="plan__cont">Everything in Silver, plus:</p>
                <ul>
                  <li className="star"><Star />$40 service calls (60% off &mdash; normally $100)</li>
                  <li className="star"><Star />6 hours/month remote support included</li>
                  <li className="star"><Star />25% off all labor charges</li>
                  <li><Check />Business-grade antivirus included</li>
                  <li><Check />Priority business scheduling</li>
                  <li><Check />Proactive system monitoring</li>
                  <li><Check />Monthly system health reports</li>
                </ul>
                <a className="btn btn--primary btn--block" href="/silver-plan">Get started</a>
              </article>
              <article className="plan plan--top reveal">
                <span className="plan__flag plan__flag--top">Top Tier</span>
                <span className="plan__badge">Platinum</span>
                <div className="plan__price"><span className="amt">$54.99</span><span className="per">/device/mo</span><span className="note">3-month minimum &middot; round-the-clock coverage when downtime isn&rsquo;t an option</span></div>
                <p className="plan__cont">Everything in Silver Plus, plus:</p>
                <ul>
                  <li className="star"><Star />$35 service calls (65% off &mdash; normally $100)</li>
                  <li className="star"><Star />24/7 remote support included</li>
                  <li className="star"><Star />30% off all labor charges</li>
                  <li><Check />Proactive system monitoring</li>
                  <li><Check />Monthly system health reports</li>
                  <li><Check />Business-grade antivirus included</li>
                </ul>
                <a className="btn btn--dark btn--block" href="/silver-plan">Get started</a>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="reviews">
          <div className="wrap">
            <div className="rev-head reveal">
              <div className="score">5.0</div>
              <div className="star-rate" style={{ fontSize: '1.5rem', margin: '2px 0' }}><span className="star-rate__fill" style={{ width: '100%' }} /></div>
              <div className="meta">Based on Google reviews from Topeka neighbors</div>
            </div>
            <div className="rev-grid">
              {REVIEWS.map((r) => (
                <article className="rev reveal" key={r.name}>
                  <div className="rev__top">
                    <span className="rev__avatar">{r.name.charAt(0)}</span>
                    <div><div className="rev__name">{r.name}</div><div className="rev__date">Google review</div></div>
                    <span className="rev__stars">★★★★★</span>
                  </div>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta section" id="contact">
          <div className="cta__circ"><img src="/assets/circuit-field-slate.svg" alt="" /></div>
          <div className="wrap">
            <h2>Something broken? Let&rsquo;s fix it today.</h2>
            <p>Book a repair, schedule a house call, or just ask a question &mdash; we usually reply within 24 hours.</p>
            <div className="cta__btns">
              <a className="btn btn--primary" href="/contact"><CalendarCheck /> Book a repair</a>
              <a className="btn btn--ghost" href={`tel:${PHONE_TEL}`}><Phone /> {PHONE_FMT}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer__circ"><img src="/assets/circuit-field-blue.svg" alt="" /></div>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/assets/csk-logo.svg" alt="Computer Store Kansas" />
              <p>Topeka&rsquo;s trusted computer repair shop since 2003. Repairs, custom builds, data recovery, and house calls &mdash; done right.</p>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <a href="/services/virus-removal">Virus Removal</a><br />
              <a href="/services/diagnostics">Repair &amp; Tune-Up</a><br />
              <a href="/services/custom-computers">Custom PC Builds</a><br />
              <a href="/services/data-services">Data Recovery</a><br />
              <a href="/contact">House Calls</a><br />
              <a href="/why-linux">Why Linux?</a>
            </div>
            <div className="footer-col">
              <h4>Visit us</h4>
              <div className="footer-loc">
                <strong>Computer Store Kansas &mdash; Topeka</strong>
                <p>2008 SW Gage Blvd, Topeka, KS 66604</p>
                <a href={`tel:${PHONE_TEL}`}>{PHONE_FMT}</a>
                <p>Mon&ndash;Fri 10am&ndash;6pm<br />Sat 10am&ndash;2pm &middot; Sun Closed</p>
              </div>
              <a href="/admin">Employee Login</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Computer Store Kansas. All rights reserved.</span>
            <span>Created &amp; maintained by Resilient Web Solutions</span>
          </div>
        </div>
      </footer>

      <div className="callbar">
        <a className="btn btn--primary" href="/contact"><CalendarCheck /> Book</a>
        <a className="btn btn--dark" href={`tel:${PHONE_TEL}`}><Phone /> Call</a>
      </div>
    </div>
  );
}
