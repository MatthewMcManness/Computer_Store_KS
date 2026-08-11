/**
 * WHY LINUX PAGE - Informational page in the how-to voice: what Linux
 * is good for, an honest fit assessment (who should and should not
 * switch), and what the shop does. Typographic circuit-motif header,
 * no photos. Funnels to the OS installation service page and the phone.
 *
 * WHEN TO EDIT: When updating the Linux guidance or the fit lists.
 */

import type { Metadata } from 'next';
import { Section } from '@/components/ui/section';
import { Eyebrow } from '@/components/ui/eyebrow';
import { CircuitMotif } from '@/components/ui/circuit-motif';
import { CTALink } from '@/components/ui/cta-link';
import { PhoneLink } from '@/components/ui/phone-link';
import { CTABand } from '@/components/pages/cta-band';
import { pageMetadata } from '@/components/seo/site-meta';

export const metadata: Metadata = pageMetadata({
  /* `title` is a bare string. The root template in src/app/layout.tsx
     appends the brand suffix, so a title carrying the brand printed it
     twice in the browser tab and in the search result. The brand goes
     on the SHARE line instead, which pageMetadata() handles. */
  title: 'What Linux Is Good For',
  description:
    'An honest look at when Linux makes sense: older computers that cannot run Windows 11, everyday web and email use, and machines that have slowed down. We install it and set it up in our Topeka shop.',
  path: '/why-linux',
  shareTitle: 'What Linux Is Good For',
  shareDescription:
    'When Linux makes sense, when it does not, and how the shop sets it up.',
});

/** Situations where Linux is a good fit, rendered as hairline rows. */
const GOOD_FIT = [
  {
    title: 'Your computer cannot upgrade to Windows 11',
    detail:
      'Microsoft ended free security updates for Windows 10 in October 2025. Linux keeps an older machine secure and current without new hardware.',
  },
  {
    title: 'You mostly use the web',
    detail:
      'Browsing, email, streaming, video calls, and documents all work well on Linux, usually faster than they did before.',
  },
  {
    title: 'A good machine has slowed down',
    detail:
      'Linux runs light. Hardware that struggles under Windows often feels quick again with a clean Linux install.',
  },
  {
    title: 'You are tired of forced updates and preinstalled junk',
    detail:
      'Updates happen on your schedule, and the system comes clean, with no trial software and no apps you did not ask for.',
  },
] as const;

/** Situations where Linux is a poor fit; honesty is the point of this page. */
const POOR_FIT = [
  {
    title: 'You depend on a specific Windows program',
    detail:
      'Some Windows software runs fine under compatibility tools and some does not. Tell us which programs you need first and we will check before anyone commits to anything.',
  },
  {
    title: 'You play certain online games',
    detail:
      'A lot of games run well on Linux now. Some big online titles still do not, so name your games and we will give you a straight answer.',
  },
  {
    title: 'You want everything to stay exactly the same',
    detail:
      'Modern Linux desktops feel familiar, but they are still a change. If any new layout is a dealbreaker, staying on Windows may be the right call.',
  },
] as const;

/** What the shop actually does for a Linux switch, as numbered steps. */
const SHOP_STEPS = [
  {
    title: 'Bring the machine in',
    detail:
      'Tell us what you use it for. We check that the hardware fits and say honestly whether Linux makes sense for you.',
  },
  {
    title: 'We install and set it up',
    detail:
      'We install Linux, set up the basics like your browser and email, and move your files over.',
  },
  {
    title: 'You get it back working',
    detail:
      'The machine comes back ready to use, with a walkthrough of what changed. If you get stuck later, call the shop.',
  },
] as const;

export default function WhyLinuxPage() {
  return (
    <>
      {/* Typographic circuit-motif header: no photos on this page */}
      <Section tone="wash" rhythm="hero" className="relative overflow-hidden">
        <CircuitMotif variant="ladder" />
        <div className="relative">
          <Eyebrow>A practical option for older machines</Eyebrow>
          <h1 className="mt-4 max-w-[20ch]">What Linux is good for</h1>
          <p className="mt-6 max-w-measure text-lg">
            Linux is a free operating system that runs fast on hardware Windows has left
            behind. For everyday computing, it does the job well on machines that struggle
            with Windows 11. We install it, set it up, and hand it back working.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <PhoneLink label="Ask if Linux fits" />
            <CTALink href="/contact" variant="quiet">
              Send us a message
            </CTALink>
          </div>
        </div>
      </Section>

      {/* Where it fits */}
      <Section tone="page" rhythm="generous">
        <h2>Where it fits</h2>
        <ul className="mt-10 list-none border-b border-line p-0">
          {GOOD_FIT.map(({ title, detail }) => (
            <li
              key={title}
              className="grid gap-x-12 gap-y-2 border-t border-line py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            >
              <h3 className="text-xl">{title}</h3>
              <p className="max-w-measure">{detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Where it does not fit: the honest half */}
      <Section tone="surface" rhythm="standard">
        <h2>Where it does not fit</h2>
        <p className="mt-4 max-w-measure">
          Linux is a tool, and no tool fits every job. We would rather tell you that at
          the counter than after an install.
        </p>
        <ul className="mt-10 list-none border-b border-line p-0">
          {POOR_FIT.map(({ title, detail }) => (
            <li
              key={title}
              className="grid gap-x-12 gap-y-2 border-t border-line py-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
            >
              <h3 className="text-xl">{title}</h3>
              <p className="max-w-measure">{detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* What the shop does */}
      <Section tone="page" rhythm="standard">
        <h2>What we do</h2>
        <ol className="mt-10 list-none border-b border-line p-0">
          {SHOP_STEPS.map(({ title, detail }, index) => (
            <li
              key={title}
              className="grid gap-x-10 gap-y-2 border-t border-line py-6 md:grid-cols-[3.5rem_minmax(0,4fr)_minmax(0,6fr)]"
            >
              <span className="text-title-sm tabular-nums text-brand" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl">{title}</h3>
              <p className="max-w-measure">{detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <CTALink href="/services/os-installation" variant="quiet">
            Read how an operating system install works here
          </CTALink>
        </div>
      </Section>

      <CTABand
        title="Bring it in and ask"
        line="Call the shop, or bring the machine in, and we will give you a straight answer on whether Linux fits."
      />
    </>
  );
}
