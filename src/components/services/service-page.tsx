/**
 * SERVICE PAGE TEMPLATE - The shared layout for all 12 service detail
 * pages. Every page reads the same way: a direct answer up top, the real
 * step-by-step process, honest pricing (the $50 diagnostic stamp where it
 * applies), a "when to bring it in" list, FAQs, and a call-first CTA band.
 *
 * Server Component, no interactivity. Copy comes from service-content.ts;
 * this file only decides how it looks.
 *
 * WHEN TO EDIT: When changing the layout of every service detail page at
 * once. To change one page's words, edit service-content.ts instead.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Section, Eyebrow, PhoneLink, CTALink, PriceStamp, BenchFrame } from '@/components/ui';
import { CTABand } from '@/components/pages/cta-band';
import { cn } from '@/lib/cn';
import { ServiceStructuredData } from './service-schema';
import type { ServiceContent } from './service-content';

interface ServicePageProps {
  service: ServiceContent;
}

/** Renders one full service detail page from its content entry. */
export function ServicePage({ service }: ServicePageProps) {
  const { photo, cost, symptoms, faqs, related, cta } = service;
  const sidePhoto = photo?.placement === 'side' ? photo : undefined;
  const widePhoto = photo?.placement === 'wide' ? photo : undefined;
  /* THE PHOTO-LESS HERO'S RIGHT COLUMN. Ten of these thirteen pages have
     no photograph, and the right half of their hero used to hold a
     circuit graphic and nothing else: a 21rem drawing standing in for a
     picture in a field about twice that wide, so the composition read as
     mostly empty whatever the drawing did. These pages are long
     informational answers, so the column now carries the page's own
     contents: four real destinations, the same hairline index module the
     /services hub hero uses. It fills the field with something a reader
     wants, and no imagery is invented to do it. */
  const contents = photo
    ? []
    : [
        { href: '#service-how', label: service.stepsHeading },
        { href: '#service-cost', label: cost.heading },
        { href: '#service-when', label: symptoms.heading },
        { href: '#service-faq', label: 'Questions we hear' },
      ];
  return (
    <>
      {/* ── Hero: eyebrow, h1, and the direct answer, first on the page ── */}
      <Section tone="wash" rhythm="hero" className="relative overflow-hidden">
        {/* The side-photo hero centres its two columns: the framed
            portrait runs taller than the type, and top-aligning them
            left a quarter of the band dead under the CTA row. The
            contents column is top-aligned instead: it is an index, and
            an index starts where the page starts. */}
        <div
          className={cn(
            sidePhoto && 'grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16',
            contents.length > 0 && 'grid gap-12 lg:grid-cols-12 lg:gap-16'
          )}
        >
          <div className={sidePhoto || contents.length > 0 ? 'lg:col-span-7' : undefined}>
            <Eyebrow>{service.eyebrow}</Eyebrow>
            <h1 className="mt-4 max-w-[22ch]">{service.h1}</h1>
            <div className="mt-6 space-y-4">
              {service.answer.map((paragraph, i) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className={i === 0 ? 'max-w-measure text-lede text-body' : 'max-w-measure'}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
              <PhoneLink label="Call" />
              <CTALink href="/contact" variant="quiet">
                Send us a message
              </CTALink>
            </div>
          </div>
          {contents.length > 0 && (
            <nav aria-label="On this page" className="lg:col-span-5 lg:pt-1.5">
              <p className="text-eyebrow uppercase text-muted">On this page</p>
              <ul className="mt-3 border-t border-line">
                {contents.map((item) => (
                  <li key={item.href} className="border-b border-line">
                    <a
                      href={item.href}
                      className="flex min-h-[52px] items-center gap-4 py-3 font-semibold text-ink no-underline transition-colors duration-fast ease-brand hover:text-brand-deep"
                    >
                      {/* The circuit node, the same 5px brand dot that
                          marks a symptom row further down the page. */}
                      <span
                        aria-hidden="true"
                        className="h-[5px] w-[5px] shrink-0 rounded-full bg-brand"
                      />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {sidePhoto && (
            <div className="lg:col-span-5">
              <BenchFrame caption={sidePhoto.caption} className="mx-auto max-w-md lg:max-w-none">
                <Image
                  src={sidePhoto.src}
                  alt={sidePhoto.alt}
                  width={sidePhoto.width}
                  height={sidePhoto.height}
                  sizes="(min-width: 1024px) 38vw, (min-width: 640px) 28rem, 100vw"
                  priority={sidePhoto.priority}
                  className="block h-auto w-full"
                />
              </BenchFrame>
            </div>
          )}
        </div>
        {/* Wide photos are art-directed derivatives cropped to their final
            framing, so they render at their own aspect with no object-fit
            cropping. The width cap keeps the file above its display size. */}
        {widePhoto && (
          <BenchFrame caption={widePhoto.caption} className="mt-14 max-w-5xl">
            <Image
              src={widePhoto.src}
              alt={widePhoto.alt}
              width={widePhoto.width}
              height={widePhoto.height}
              sizes="(min-width: 1088px) 64rem, 100vw"
              priority={widePhoto.priority}
              className="block h-auto w-full"
            />
          </BenchFrame>
        )}
      </Section>

      {/* ── The real process, as editorial numbered rows. Label left, body
             in a second column at the right, so the rules span the full
             container instead of stopping two thirds across. ── */}
      <Section tone="page" rhythm="standard" aria-labelledby="service-how">
        <h2 id="service-how" className="scroll-mt-28">{service.stepsHeading}</h2>
        <ol className="mt-10 border-t border-line">
          {service.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid gap-x-10 gap-y-2 border-b border-line py-7 md:grid-cols-[3.5rem_minmax(0,4fr)_minmax(0,6fr)]"
            >
              <span
                aria-hidden="true"
                className="text-title-sm tabular-nums leading-none text-brand-deep"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="block text-lg font-bold leading-snug text-ink">{step.title}</span>
              <p className="max-w-measure text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* ── Honest pricing. The stamp is the site's signature element, so
             it gets exactly one treatment here: the raised white feature
             panel, the same object the homepage hero uses. It leads the
             band as its own column instead of floating at the top right
             of empty space, which is what made a signature read as a
             loose fragment. The compact inline stamp is the only other
             sanctioned treatment, and it belongs to index rows. ── */}
      <Section tone="surface" rhythm="compact" aria-labelledby="service-cost">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {cost.stamp && (
            <div className="flex max-w-full rounded-brand-md bg-page px-5 py-4 shadow-raised sm:w-fit sm:px-6 lg:self-start">
              <PriceStamp
                amount={cost.stamp.amount}
                caption={cost.stamp.caption}
                layout="row"
              />
            </div>
          )}
          <div className={cost.stamp ? undefined : 'lg:col-span-2'}>
            <h2 id="service-cost" className="scroll-mt-28">{cost.heading}</h2>
            <div className="mt-5 space-y-4">
              {cost.lines.map((line) => (
                <p key={line.slice(0, 24)} className="max-w-measure">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Symptom list as hairline rows with circuit-node markers ── */}
      <Section tone="page" rhythm="compact" aria-labelledby="service-when">
        <h2 id="service-when" className="scroll-mt-28">{symptoms.heading}</h2>
        {/* Two columns of full-width rows: at one column these hairlines
            stopped around 60% of the canvas and left the right half of
            every symptom row empty for the whole scroll.

            THE ODD ROW RUNS FULL WIDTH. Nine of these thirteen pages
            list five symptoms, and a five-item two-column grid leaves
            the last cell empty: the left column closed one row lower
            than the right and its final hairline hung in mid-air. The
            odd item spans both columns instead, so the block always
            closes on one rule across the container. */}
        <ul className="mt-8 grid border-t border-line md:grid-cols-2 md:gap-x-16">
          {symptoms.items.map((item, i) => (
            <li
              key={item}
              className={cn(
                'flex items-start gap-4 border-b border-line py-4',
                symptoms.items.length % 2 === 1 &&
                  i === symptoms.items.length - 1 &&
                  'md:col-span-2'
              )}
            >
              <span
                aria-hidden="true"
                className="mt-[0.55em] h-[5px] w-[5px] shrink-0 rounded-full bg-brand"
              />
              <span className="max-w-measure">{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Real FAQs, plain and visible (also emitted as FAQPage schema) ── */}
      <Section tone="wash" rhythm="standard" aria-labelledby="service-faq">
        <h2 id="service-faq" className="scroll-mt-28">Questions we hear</h2>
        {/* Question left, answer right: the rules run the full container
            rather than terminating mid-canvas. */}
        <div className="mt-6 divide-y divide-line">
          {faqs.map((faq) => (
            <div key={faq.q} className="grid gap-x-12 gap-y-3 py-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <h3 className="max-w-[26ch]">{faq.q}</h3>
              <p className="max-w-measure">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Call-first closing band, with the related-service links seated
             under it inside the same band ── */}
      <CTABand headingId="service-cta" title={cta.heading} line={cta.line}>
        {related.length > 0 && (
          <nav aria-label="Related services" className="mt-12 border-t border-line pt-6">
            <span className="block text-eyebrow uppercase text-muted">Related</span>
            <ul className="mt-1 flex flex-wrap gap-x-8">
              {related.map((rel) => (
                <li key={rel.href}>
                  <Link
                    href={rel.href}
                    className="inline-flex min-h-[44px] items-center py-2 font-semibold text-brand-deep no-underline transition-colors duration-fast ease-brand hover:underline hover:underline-offset-4"
                  >
                    {rel.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </CTABand>

      <ServiceStructuredData service={service} />
    </>
  );
}
