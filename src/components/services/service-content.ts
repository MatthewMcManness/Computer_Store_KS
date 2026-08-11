/**
 * SERVICE CONTENT - All the words on the services hub and the 13 service
 * detail pages: headlines, step-by-step process copy, pricing lines,
 * symptom lists, and FAQs. The ServicePage template reads from here.
 *
 * Pricing policy (from the owner onboarding): show the $50 diagnostic
 * (it applies toward the repair) and fixed prices only. Never list
 * variable labor rates or in-stock computer prices.
 *
 * WHEN TO EDIT: When changing what any service page says. Find the
 * service by its slug below and edit the text. Metadata (browser tab
 * title, search description) lives in each page file instead.
 */

import { BUSINESS_INFO } from '@/lib/constants';

/** All 13 service detail page slugs (the /services/<slug> routes). */
export type ServiceSlug =
  | 'service-calls'
  | 'diagnostics'
  | 'virus-removal'
  | 'upgrades'
  | 'laptops'
  | 'desktops'
  | 'os-installation'
  | 'debloat'
  | 'antivirus'
  | 'data-services'
  | 'custom-computers'
  | 'printers'
  | 'recycling';

interface ServiceStep {
  title: string;
  body: string;
}

interface ServiceFaq {
  q: string;
  a: string;
}

interface ServicePhoto {
  /** Art-directed derivative in public/assets, never a raw camera original */
  src: string;
  alt: string;
  caption: string;
  /** Intrinsic pixel width of the derivative file */
  width: number;
  /** Intrinsic pixel height of the derivative file */
  height: number;
  /** 'wide' renders full-width under the hero text; 'side' renders as the hero's right column */
  placement: 'wide' | 'side';
  /**
   * True when this photo is the page's LCP element, which it is on every
   * detail page that has one: both placements paint above the fold at
   * 1440x900. Threads through to next/image so the browser fetches it
   * eagerly at high priority instead of lazy-loading the largest paint.
   */
  priority?: boolean;
}

export interface ServiceContent {
  slug: ServiceSlug;
  /** Short name used in hub rows and related-service links */
  name: string;
  /** One plain sentence for the hub index row */
  indexLine: string;
  /** Letterspaced caps label above the h1 */
  eyebrow: string;
  /** Page h1, in plain question or statement form */
  h1: string;
  /** Direct answer paragraphs; the first one leads the page */
  answer: string[];
  photo?: ServicePhoto;
  stepsHeading: string;
  steps: ServiceStep[];
  cost: {
    heading: string;
    /** Fixed-price stamp; omitted where no fixed price applies (sales pages).
     *  No size here on purpose: the cost band has exactly one sanctioned
     *  stamp treatment (the raised feature panel), so a per-service size
     *  would only let the signature drift again. */
    stamp?: { amount: number; caption: string };
    lines: string[];
  };
  symptoms: {
    heading: string;
    items: string[];
  };
  faqs: ServiceFaq[];
  related: { href: string; label: string }[];
  /** schema.org Service serviceType value */
  schemaServiceType: string;
  cta: { heading: string; line: string };
}

const ADDRESS = BUSINESS_INFO.addressLine1;

/** Content for all 13 service detail pages, keyed by route slug. */
export const SERVICES: Record<ServiceSlug, ServiceContent> = {
  /* Revenue priority #2 in docs/profile/services.md ("Most important
     financially"), and the line the onboarding brief points at with the
     emergency-animal-clinic example. It carries no fixed price because
     none is documented: on-site work is variable labor, which the
     pricing policy keeps off the site. Call-for-pricing only. */
  'service-calls': {
    slug: 'service-calls',
    name: 'Service calls and house calls',
    /* Not a shortened copy of the business band's paragraph on the hub.
       The two sat on the same page saying the same sentence at two
       lengths under the same heading. */
    indexLine: 'Some jobs cannot come to the bench, so we come to the machine.',
    eyebrow: 'On-site and business IT',
    h1: 'When we come to you',
    answer: [
      `Some work cannot come to the bench. A service call brings us to your office or your house to sort out what you have on site: machines that will not talk to each other, printers that stopped working, a setup nobody has touched in years. For businesses this goes further, up to a full IT reset with new machines set up and ready to use.`,
      `The people who come out are the same people who work the bench at ${ADDRESS}. There is no subcontractor and no call center in between.`,
    ],
    stepsHeading: 'How a service call works',
    steps: [
      {
        title: 'Call and tell us what you are running',
        body: 'How many machines, what they do, and what is going wrong. That is usually enough for us to know what the visit needs.',
      },
      {
        title: 'We schedule the visit',
        body: 'We agree on a time that works around your business hours rather than ours.',
      },
      {
        title: 'We work on site',
        body: 'Machines, printers, and the connections between them, handled where they sit. Most of it gets solved in the visit.',
      },
      {
        title: 'Anything bigger comes back to the shop',
        body: 'If a machine needs bench time, it comes back with us and every repair still happens in-house.',
      },
      {
        title: 'You know the cost before we start',
        body: 'We tell you what the work will run and wait for your go-ahead. Nothing gets billed as a surprise.',
      },
    ],
    cost: {
      heading: 'What it costs',
      lines: [
        'Service calls are quoted per visit, because no two sites are the same. Call the shop, describe the setup, and we will give you the number before we schedule anything.',
        /* The discount is documented. Why a business buys the plan is
           not, and the old wording asserted a customer motivation no
           source supports. The benefit stands on its own. */
        'Silver plan members get 50% off house calls, which is where the plan pays for itself on a business with several machines.',
      ],
    },
    symptoms: {
      heading: 'When to book one',
      items: [
        'A business computer is down and the work stops with it',
        'You are opening or moving an office and the machines need setting up',
        'Printers or shared drives stopped working for everyone at once',
        'Nobody on staff owns the computers, and it shows',
        'You want one shop that knows your setup before something breaks',
        'The machine is too awkward to unplug and carry in',
      ],
    },
    faqs: [
      {
        q: 'Do you only do service calls for businesses?',
        a: 'No. Businesses are the bulk of it, but we do house calls for individuals too, and Silver plan members get half off them.',
      },
      {
        q: 'How much does a service call cost?',
        a: 'It depends on the site and the work, so we quote it before we schedule. Call the shop and describe the setup and we will give you the number.',
      },
      {
        q: 'Can you handle our whole office?',
        a: 'Yes. Full IT resets are a normal job for us: we sort out what you have, set up new machines where they are needed, and get the office working as one thing again.',
      },
      {
        q: 'What if a machine needs more than an on-site fix?',
        a: 'It comes back to the shop with us. Every repair happens in-house, so it never leaves our building once it is here.',
      },
    ],
    related: [
      { href: '/silver-plan', label: 'The Silver plan' },
      { href: '/services/printers', label: 'Printer setup and repair' },
      { href: '/services/custom-computers', label: 'New machines built to spec' },
    ],
    schemaServiceType: 'On-Site Computer and IT Support',
    cta: {
      heading: 'Tell us about your setup',
      line: 'Call the shop, say how many machines you run and what is going wrong, and we will tell you what the visit takes.',
    },
  },
  diagnostics: {
    slug: 'diagnostics',
    name: 'Diagnostics',
    indexLine:
      'A flat-fee inspection that finds the real problem before you spend money on a fix.',
    eyebrow: 'In-house repair',
    h1: 'What a computer diagnostic covers',
    answer: [
      `A diagnostic is a full inspection of your computer that finds out what is actually wrong before you spend money on a fix. It costs $50 flat, and the whole fee applies toward your repair. We test the hardware and the software in our shop at ${ADDRESS}, and most results are ready the same day.`,
    ],
    /* NO PHOTO, deliberately. This page carried a hand-held shot of the
       bench monitor running FurMark: soft, moire-prone, and the orange
       fireball on the screen was the loudest colour anywhere on the
       site, louder than the one sanctioned gold accent. Every crop of
       that frame was tried, including a hard crop into the screen with
       the warm channel pulled toward neutral, and the sharpest result
       was still an out-of-focus blob. Leading the shop's most important
       service page with it was worse than leading with the trace
       graphic every other photo-less service page uses. Restore a photo
       here the moment a sharp bench shot exists: the diagnostic is the
       offer the whole price list rests on and it deserves one. */
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'Drop it off and tell us what it is doing',
        body: 'Describe the problem in your own words. A strange noise, a black screen, slow since Tuesday. That is all we need to start.',
      },
      {
        title: 'We test the hardware',
        body: 'Drives, memory, power supply, motherboard, and cooling all get checked on the bench.',
      },
      {
        title: 'We check the software',
        body: 'Windows, drivers, startup programs, and malware. Plenty of machines that seem dead turn out to have a software problem.',
      },
      {
        title: 'Small fixes happen on the spot',
        body: 'If the fix needs no parts, we handle it, and it is included in the $50.',
      },
      {
        title: 'You get a plain answer',
        body: 'We call you with what is wrong, what fixing it costs, and whether it is worth it. Nothing else happens without your OK.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'The diagnostic is $50, always. If you go ahead with the repair, that $50 comes off the bill.',
        'Fixes that need no parts are included in the fee. Anything bigger gets quoted after the diagnostic, and we wait for your go-ahead before touching it.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'It will not turn on, or lights come on and nothing else happens',
        'Blue screens or random crashes',
        'It runs far slower than it used to',
        'Clicking, grinding, or loud fan noise',
        'It gets hot and shuts itself down',
        'It sticks on a loading screen and never reaches the desktop',
      ],
    },
    faqs: [
      {
        q: 'How long does a diagnostic take?',
        a: 'Most are done the same day. When the bench is full it can take up to 48 hours, and we tell you at drop-off if we are running behind.',
      },
      {
        q: 'Do I pay the $50 on top of the repair?',
        a: 'No. The diagnostic fee applies toward your repair. You only pay it by itself if you decide the machine is not worth fixing.',
      },
      {
        q: 'What if it is not worth fixing?',
        a: 'We say so. You get an honest read on the repair cost against the value of the machine, and the choice stays yours.',
      },
      {
        q: 'Does my computer stay in the shop?',
        a: `Yes. Every diagnostic happens in our shop at ${ADDRESS}. Your machine and your data never leave the building.`,
      },
    ],
    related: [
      { href: '/services/virus-removal', label: 'Virus and malware removal' },
      { href: '/services/upgrades', label: 'Hardware upgrades' },
    ],
    schemaServiceType: 'Computer Diagnostics',
    cta: {
      heading: 'Find out what is wrong',
      line: 'Bring it by the shop, or call and describe what it is doing. We will tell you where to start.',
    },
  },

  'virus-removal': {
    slug: 'virus-removal',
    name: 'Virus and malware removal',
    indexLine:
      'A full cleanup of viruses, spyware, and scam software, verified clean before it goes home.',
    eyebrow: 'In-house repair',
    h1: 'How virus and malware removal works',
    answer: [
      'When a computer picks up a virus, malware, or scam software, we clean it in our shop and verify it is actually gone before it goes home. The work starts with the $50 diagnostic, which shows how deep the infection runs and applies toward the work.',
      'If someone called claiming to be tech support and got into your machine, bring it in. We check for remote-access tools and lock the machine back down.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'The diagnostic comes first',
        body: 'The $50 diagnostic shows what got in and how far it spread. It applies toward the work.',
      },
      {
        title: 'We scan with more than one tool',
        body: 'A single scanner misses things. We run several, including checks for rootkits that hide from ordinary antivirus.',
      },
      {
        title: 'We remove what the scanners cannot',
        body: 'Some infections take hand work: browser hijackers, fake warning pop-ups, and programs that reinstall themselves.',
      },
      {
        title: 'We put the browser back the way it was',
        body: 'Homepage, search engine, and extensions restored. Pop-ups gone.',
      },
      {
        title: 'We verify it boots clean',
        body: 'Updates applied, protection checked, and the machine watched through restarts before we call it done.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'The cleanup is quoted after the diagnostic, and the $50 applies toward the work.',
        'If an infection runs too deep to trust a cleanup, we recommend a fresh Windows install and move your files over instead. You hear that recommendation before any work happens.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'Pop-ups appear even when the browser is closed',
        'Your homepage or search engine changed on its own',
        'A warning with a phone number claims your computer is infected',
        'Programs you never installed keep showing up',
        'Your antivirus is off and will not stay on',
        'Someone took control of the machine after a phone call',
      ],
    },
    faqs: [
      {
        q: 'Can you remove it without wiping the computer?',
        a: 'Usually, yes. When an infection sits too deep to trust a cleanup, the honest fix is a fresh install with your files moved over. Either way, you decide before we proceed.',
      },
      {
        q: 'I let a caller remote into my computer. Now what?',
        a: 'Stop using it for banking and bring it in. We check for remote-access tools, remove them, and walk you through what to change afterward.',
      },
      {
        q: 'How do I keep this from happening again?',
        a: 'Ask about protection while you are here. We install and manage ESET antivirus and scam protection, so staying safe does not depend on you catching every trick.',
      },
    ],
    related: [
      { href: '/services/antivirus', label: 'Antivirus and scam protection' },
      { href: '/services/os-installation', label: 'Fresh Windows install' },
    ],
    schemaServiceType: 'Virus and Malware Removal',
    cta: {
      heading: 'Get the machine clean',
      line: 'The longer an infection sits, the more it touches. Call and we will get it on the bench.',
    },
  },

  upgrades: {
    slug: 'upgrades',
    name: 'Hardware upgrades',
    indexLine:
      'SSD, memory, and graphics upgrades, plus blowout cleanings, repastes, and cooler installs.',
    eyebrow: 'In-house repair',
    h1: 'How a hardware upgrade works here',
    answer: [
      'A slow computer often needs one targeted part, an SSD, more memory, or a better graphics card, for a fraction of the price of a new machine. We check what your computer supports, quote the job before we start, and do the work in our shop. When an upgrade is a bad buy, we say so.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'Tell us the machine and the goal',
        body: 'Faster boot, smoother games, more open tabs. The goal decides the part.',
      },
      {
        title: 'We check what it supports',
        body: 'Memory type, drive slots, power supply headroom, and whether the board can take the part at all.',
      },
      {
        title: 'You approve a quote first',
        body: 'Parts and labor, stated plainly, before we order or open anything.',
      },
      {
        title: 'We install and test',
        body: 'The part goes in on the bench and the machine gets tested before pickup. Moving to an SSD? We clone your old drive so nothing is lost.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      /* The flat-rate line is NOT optional copy. Both
         docs/notes/2026-07-08_redesign-onboarding-brief.md and
         docs/profile/services.md name laptop and desktop blowout, CPU
         repaste, and cooler installs as jobs that are always the same,
         and the owner asked for them to be shown as fixed price. The
         site said "quoted after diagnosis" for them, which states his
         pricing model backwards. The dollar amounts are not documented
         anywhere, so they are NOT invented here: the mechanism is
         stated and the number is a phone call. Drop the numbers in
         where "Call for the current rate" sits once Max confirms them. */
      lines: [
        'A straight upgrade is quoted up front: the parts plus the labor for your specific machine.',
        'Blowout cleanings, thermal repastes, and cooler installs are flat-rate jobs. The work is the same every time, so the price is too. Call for the current rate.',
        'Not sure why the machine is slow? Start with the $50 diagnostic. It finds the real bottleneck and applies toward the work.',
      ],
    },
    symptoms: {
      heading: 'When an upgrade makes sense',
      items: [
        'Boot takes minutes and the machine still has a spinning hard drive',
        'Everything grinds to a halt with a few programs open',
        'Games stutter or will not hold their settings',
        'Storage is nearly full and the machine is slowing with it',
        'It runs hot and needs a blowout cleaning, fresh thermal paste, or a better cooler',
        'A laptop that feels old but whose model allows a drive or memory upgrade',
      ],
    },
    faqs: [
      {
        q: 'Can I bring my own parts?',
        a: 'Yes. Bring the parts and we install them. We can also source parts for you and fold them into the quote.',
      },
      {
        q: 'Is my laptop upgradeable?',
        a: 'Often the drive, and sometimes the memory. Some laptops have memory soldered to the board. We check yours and tell you straight before promising anything.',
      },
      {
        q: 'Is upgrading always worth it?',
        a: 'No. Some machines are too old to justify new parts. If the money is better spent on a different computer, we tell you that instead.',
      },
    ],
    related: [
      { href: '/services/diagnostics', label: 'Diagnostics' },
      { href: '/services/custom-computers', label: 'Custom builds' },
    ],
    schemaServiceType: 'Computer Hardware Upgrades',
    cta: {
      heading: 'See what your machine can do',
      line: 'Call with the model, or bring it in. We will tell you which upgrade actually helps.',
    },
  },

  laptops: {
    slug: 'laptops',
    name: 'Laptops',
    indexLine:
      'Screens, batteries, and drives repaired in-house, plus new Asus and Lenovo laptops, and tested refurbs.',
    eyebrow: 'In-house repair',
    h1: 'How a laptop repair works here',
    answer: [
      'Laptop repairs happen on our bench: screens, batteries, keyboards, drives, and overheating. The work starts with the $50 diagnostic, which applies toward the repair, and your laptop and your data never leave the building.',
      'We also sell new Asus and Lenovo laptops and tested refurbished machines, so when a repair stops making sense, better options sit on the same counter.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'Drop it off and tell us what happened',
        body: 'A cracked screen, a spill, a battery that dies by lunch. The $50 diagnostic confirms the real damage.',
      },
      {
        title: 'We open it up in the shop',
        body: 'Laptops are cramped and every model is different. Yours gets worked on here, on the bench, never shipped out.',
      },
      {
        title: 'You get a straight quote',
        body: 'Parts and labor for your exact model. If the repair costs more than the laptop is worth, we say that instead.',
      },
      {
        title: 'We fix it and test it',
        body: 'Screen, hinge, battery, keyboard, drive, or cooling. It gets tested before you get the call.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'A screen, battery, or port job is quoted after the diagnostic, and the $50 applies toward the work.',
        'If a repair is a bad buy for your model, we tell you before you spend anything past the diagnostic.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'Cracked, black, or flickering screen',
        'A battery that will not hold a charge through the morning',
        'It overheats or shuts down in your lap',
        'A broken hinge, port, or keyboard',
        'Slow enough that you avoid using it',
      ],
    },
    faqs: [
      {
        q: 'Is it worth repairing, or should I replace it?',
        a: 'The diagnostic answers that with real numbers. When a repair does not make sense, we lay the repair quote next to what a new or refurbished laptop costs, and you choose.',
      },
      {
        q: 'Do you sell laptops too?',
        a: 'Yes. New Asus and Lenovo models in stock and by custom order, plus refurbished laptops that are inspected, stress tested, and rebuilt where needed. Refurbs carry a 3-month parts warranty and 6 months of free diagnostics. New laptops bought here get free diagnostics for life.',
      },
      {
        q: 'Can my laptop be upgraded instead?',
        a: 'Often. Most models take an SSD and many take more memory, though some have memory soldered to the board. We check yours before promising anything.',
      },
    ],
    related: [
      { href: '/services/upgrades', label: 'Hardware upgrades' },
      { href: '/services/desktops', label: 'Desktops' },
    ],
    schemaServiceType: 'Laptop Repair and Sales',
    cta: {
      heading: 'Get it on the bench',
      line: 'Call or walk in. The diagnostic tells you exactly where you stand.',
    },
  },

  desktops: {
    slug: 'desktops',
    name: 'Desktops',
    indexLine:
      'Desktop repair in-house, plus refurbished machines rebuilt and stress tested on our bench.',
    eyebrow: 'In-house repair',
    h1: 'How we refurbish a desktop',
    answer: [
      'Every refurbished desktop we sell goes through the same process: sourced from well-kept corporate machines, inspected, tested hard, rebuilt where needed, and loaded with a clean operating system. It is the same bench work we do for repairs, which is why we stand behind what we sell.',
      'We repair desktops too. Same shop, same $50 diagnostic that applies toward the work.',
    ],
    stepsHeading: 'How a machine earns the floor',
    steps: [
      {
        title: 'Sourcing',
        body: 'Corporate lease returns, trade-ins, and business upgrades. Machines that were maintained and have life left in them.',
      },
      {
        title: 'Inspection',
        body: 'Case, motherboard, drives, memory, ports, and power supply. Every component gets checked.',
      },
      {
        title: 'Stress testing',
        body: 'Hard testing pushes the machine to its limits and shows up parts that are failing or close to it.',
      },
      {
        title: 'Rebuild',
        body: 'Failed and suspect parts are replaced. Many units get a faster drive or more memory while they are open.',
      },
      {
        title: 'Fresh install and final test',
        body: 'A clean operating system wipes any previous data, then one more round of testing before it goes on the floor.',
      },
    ],
    cost: {
      heading: 'What it costs',
      lines: [
        'In-store stock and prices change with what comes in, so call for what is on the floor today.',
        'Every refurbished desktop carries a 3-month parts warranty and 6 months of free diagnostics. Desktop repairs start with the $50 diagnostic, which applies toward the work.',
      ],
    },
    symptoms: {
      heading: 'When a refurbished desktop is the right buy',
      items: [
        'An everyday home machine for browsing, email, and streaming',
        'Office desks that need dependable computers without the new-PC price',
        'Computer labs, libraries, and organizations stretching a budget',
        'A base for a budget gaming build, with a graphics card added',
        'A spare machine that simply needs to work',
      ],
    },
    faqs: [
      {
        q: 'What warranty comes with a refurbished desktop?',
        a: 'A 3-month parts warranty and 6 months of free diagnostics. If something goes wrong, we take care of it.',
      },
      {
        q: 'Can a refurbished desktop handle gaming?',
        a: 'A solid unit with a decent processor and enough memory makes a good base. Add a graphics card and it will handle a lot. Ask which machines on the floor are good candidates.',
      },
      {
        q: 'Do you fix desktops as well as sell them?',
        a: 'Yes. Desktop repair happens in the same shop, starting with the $50 diagnostic that applies toward the repair.',
      },
    ],
    related: [
      { href: '/services/custom-computers', label: 'Custom builds' },
      { href: '/services/diagnostics', label: 'Diagnostics' },
    ],
    schemaServiceType: 'Desktop Repair and Refurbished Computer Sales',
    cta: {
      heading: 'See what is on the floor',
      line: 'Stock changes with what comes in. Call before you drive over and we will tell you what is here.',
    },
  },

  'os-installation': {
    slug: 'os-installation',
    name: 'Windows and Linux installation',
    indexLine:
      'A fresh Windows install with the license included, or Zorin OS Linux for machines Windows 11 left behind.',
    eyebrow: 'Software',
    h1: 'How a fresh Windows or Linux install works',
    answer: [
      'A fresh operating system install wipes the drive and puts down a clean copy of Windows or Linux, with drivers, updates, and setup finished before pickup. Windows installs include the license. For machines that cannot run Windows 11, we install Zorin OS, a Linux built to feel familiar to Windows users.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'Your files come off first',
        body: 'A fresh install clears the drive. Tell us what to keep and we move it to safety before anything is wiped.',
      },
      {
        title: 'The system goes on clean',
        body: 'Windows with a genuine license included, or Zorin OS for a machine that has aged out of Windows.',
      },
      {
        title: 'Drivers and updates get handled',
        body: 'Everything current and working before you pick it up, with none of the preloaded junk.',
      },
      {
        title: 'The desktop is set up for you',
        body: 'Accounts created, requested programs installed, and Zorin laid out to match the Windows you are used to.',
      },
      {
        title: 'Dual-boot if you want both',
        body: 'Windows and Linux on one machine. You pick which one at startup.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'The install is quoted after the diagnostic, and the $50 applies toward the work.',
        'Windows installs include a genuine license. No hunting for product keys.',
      ],
    },
    symptoms: {
      heading: 'When a fresh install is the right fix',
      items: [
        'Windows will not start or keeps crashing no matter what',
        'A severe infection where a cleanup cannot be trusted',
        'A new SSD that deserves a clean system on it',
        'A good computer that Microsoft says is too old for Windows 11',
        'A machine you are selling or giving away and want wiped properly',
      ],
    },
    faqs: [
      {
        q: 'What happens to my files?',
        a: 'A fresh install wipes the drive. Tell us what to keep and we transfer it to the new system first, with documents back where documents belong.',
      },
      {
        q: 'Which Linux do you install?',
        a: 'Zorin OS. It is built for people coming from Windows, and we set the desktop layout to match what you already know.',
      },
      {
        q: 'Can one computer run both?',
        a: 'Yes. A dual-boot setup lets you choose Windows or Linux each time the machine starts.',
      },
    ],
    related: [
      { href: '/why-linux', label: 'Why Linux' },
      { href: '/services/data-services', label: 'Data transfer' },
    ],
    schemaServiceType: 'Operating System Installation',
    cta: {
      heading: 'Start clean',
      line: 'Bring the machine in and tell us what to save. We handle the rest.',
    },
  },

  debloat: {
    slug: 'debloat',
    name: 'Windows debloat',
    indexLine:
      'Preloaded junk and startup clutter stripped out so Windows runs the way it should.',
    eyebrow: 'Software',
    h1: 'What a Windows debloat does',
    answer: [
      'A debloat removes the software your computer came with but you never asked for: manufacturer trials, preloaded apps, and programs that launch at startup and run in the background. The machine boots faster and responds quicker because it stops doing work you never wanted.',
      'Every computer we sell is debloated before it leaves the shop, at no charge.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'We look at what is installed and what runs at startup',
        body: 'Separating the programs you use from the ones that shipped in the box.',
      },
      {
        title: 'We remove the junk',
        body: 'Trial software, manufacturer utilities, and preloaded apps you never opened.',
      },
      {
        title: 'We trim the startup list',
        body: 'Programs that launch themselves at boot are the biggest everyday slowdown. They stop.',
      },
      {
        title: 'We tune the settings',
        body: 'Windows set for speed and responsiveness instead of whatever the factory chose.',
      },
      {
        title: 'We confirm nothing you use was touched',
        body: 'Your files and programs stay. The machine boots, and everything you actually use still works.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'The debloat is quoted after the diagnostic, and the $50 applies toward the work.',
        'Buy a computer from us and the debloat is already done, free.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'A new computer that was slow the day you unboxed it',
        'A start menu full of apps you never installed',
        'Boot takes minutes before you can click anything',
        'Fans spin with nothing open',
        'Windows 11 feels slower than Windows 10 did on the same machine',
      ],
    },
    faqs: [
      {
        q: 'Will I lose my files or programs?',
        a: 'No. A debloat removes software you never used. Your files and the programs you rely on stay put, and we check with you before removing anything questionable.',
      },
      {
        q: 'Is this the same as virus removal?',
        a: 'No. A debloat removes legitimate software you never wanted. Virus removal handles malicious software. Bring the machine in and we will tell you which one it needs.',
      },
      {
        q: 'Does it help Windows 11?',
        a: 'Yes. Windows 11 ships with a lot preloaded, and manufacturers add more on top. A debloat gets it back to feeling quick.',
      },
    ],
    related: [
      { href: '/services/virus-removal', label: 'Virus and malware removal' },
      { href: '/services/os-installation', label: 'Fresh Windows install' },
    ],
    schemaServiceType: 'Windows Optimization and Debloat',
    cta: {
      heading: 'Get the junk out',
      line: 'Bring the machine in and it comes back quicker. Call if you are not sure what it needs.',
    },
  },

  antivirus: {
    slug: 'antivirus',
    name: 'Antivirus and scam protection',
    indexLine:
      'ESET antivirus and scam protection, installed, configured, and managed by the shop.',
    eyebrow: 'Software',
    h1: 'How we set up antivirus and scam protection',
    answer: [
      'We install and configure ESET antivirus, add scam protection that catches the tricks antivirus cannot, and handle the renewals and support ourselves. You get protection that works without having to manage any of it. Max holds the ESET certification, so setup and support happen right here in the shop.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'We match the protection to how you use the computer',
        body: 'ESET antivirus covers malicious software. Scam protection covers fake support pop-ups, lookalike websites, and phishing links.',
      },
      {
        title: 'We install and configure it',
        body: 'No setup wizards to fight. It is installed, set correctly, and tested before you leave.',
      },
      {
        title: 'We show you what to expect',
        body: 'A short walkthrough of what an alert looks like and what to do when you see one.',
      },
      {
        title: 'We handle renewals',
        body: 'Call within 30 days of your subscription expiring and we take care of the renewal over the phone.',
      },
      {
        title: 'Problems come to us',
        body: 'If the software acts up, bring the machine in. You never sit on hold with a software company.',
      },
    ],
    cost: {
      heading: 'What it costs',
      lines: [
        'ESET antivirus is a yearly subscription. Scam protection is a one-time install with no renewal.',
        'Software prices change, so call for current pricing. The installation is quoted plainly when you call.',
      ],
    },
    symptoms: {
      heading: 'When it is time for protection',
      items: [
        'You just had an infection cleaned and want it to be the last one',
        'A new computer with nothing but a trial guarding it',
        'A subscription about to lapse and no interest in managing the renewal',
        'A fake virus warning nearly got you to call the number on the screen',
        'You want scam alerts sent to a trusted family member',
      ],
    },
    faqs: [
      {
        q: 'Why ESET?',
        a: 'It detects well, runs light, and stays quiet instead of nagging you with pop-ups. Max holds the ESET certification, so we can install it, tune it, and fix it ourselves.',
      },
      {
        q: 'What does scam protection add?',
        a: 'Antivirus catches malicious software. Scam protection blocks remote-access tools, fake virus warnings, lookalike websites, and phishing links: the tricks aimed at people rather than machines. It can also send alerts to a trusted family member.',
      },
      {
        q: 'What happens when the subscription runs out?',
        a: 'Call us within 30 days of expiration and we handle the renewal over the phone. No lapsed protection, no wrestling with account pages.',
      },
    ],
    related: [{ href: '/services/virus-removal', label: 'Virus and malware removal' }],
    schemaServiceType: 'Antivirus Installation and Scam Protection',
    cta: {
      heading: 'Get protected before something gets in',
      line: 'Bring your computer in and we set it up while you are here.',
    },
  },

  'data-services': {
    slug: 'data-services',
    name: 'Data transfer and recovery',
    indexLine:
      'Transfers to a new machine, drive cloning, and recovery from failing drives, all inside the shop.',
    eyebrow: 'Data',
    h1: 'How data transfer and recovery work',
    answer: [
      'We move files to a new computer, clone whole drives, and recover what we can from drives that are failing. All of it happens inside our shop. Your drive and everything on it never leave the building.',
      'And if a recovery attempt gets nothing back, the recovery costs you nothing.',
    ],
    stepsHeading: 'How the job works',
    steps: [
      {
        title: 'Bring the machines or just the drives',
        body: 'Old and new computer, or the bare drives. Either works.',
      },
      {
        title: 'We check drive health first',
        body: 'Pushing a dying drive too hard can finish it off, so recovery jobs start carefully.',
      },
      {
        title: 'We copy or clone',
        body: 'A transfer moves your files. A clone copies the whole drive: system, programs, settings, everything. Clones are how an SSD upgrade keeps your computer feeling like your computer.',
      },
      {
        title: 'Files go back where they belong',
        body: 'Documents in Documents, pictures in Pictures, bookmarks and saved passwords in the browser. No digging through a dumped folder to find your own files.',
      },
      {
        title: 'You check it before you leave',
        body: 'We walk through the result with you so nothing is missing.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'Transfers and clones are quoted after the diagnostic, and the $50 applies toward the work.',
        'Recovery from a failing drive carries no risk to you: if we cannot get your data back, you owe nothing for the attempt.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'Clicking or grinding sounds from the drive',
        'A new computer and everything needs to come over',
        'An SSD upgrade where the whole system should move with it',
        'A drive that is nearly full or slowing the machine down',
        'You want a full copy of a drive before something breaks',
      ],
    },
    faqs: [
      {
        q: 'Is my data kept private?',
        a: 'Yes. The work happens in our shop, on our bench, and your drive never leaves the building. Files are handled confidentially.',
      },
      {
        q: 'What if the data cannot be recovered?',
        a: 'Then the recovery attempt costs you nothing. You only pay when we get your files back.',
      },
      {
        q: 'Do bookmarks and passwords come over?',
        a: 'Yes, where the browser allows it. Bookmarks, favorites, and saved passwords are part of the restore.',
      },
    ],
    related: [
      { href: '/services/upgrades', label: 'SSD upgrades' },
      { href: '/services/os-installation', label: 'Fresh installs' },
    ],
    schemaServiceType: 'Data Transfer and Recovery',
    cta: {
      heading: 'Get your data somewhere safe',
      line: 'A failing drive does not get better on its own. Bring it in while the files are still there.',
    },
  },

  'custom-computers': {
    slug: 'custom-computers',
    name: 'Custom builds',
    indexLine:
      'Gaming rigs, workstations, and office machines, built to spec and burned in before pickup.',
    eyebrow: 'Built in the shop',
    h1: 'How a custom build comes together',
    answer: [
      'A custom build starts with what the machine is for and what you want to spend. We plan the parts with you, build it in the shop, and stress test it before you pick it up. You pay for the parts plus a flat build fee, quoted before anything is ordered.',
    ],
    photo: {
      src: '/assets/custom-build-interior.jpg',
      alt: 'The full interior of a finished custom build, from the top cooling fans down past the graphics card to the motherboard',
      caption: 'Inside a finished build, top to bottom',
      width: 1200,
      height: 1403,
      placement: 'side',
      priority: true,
    },
    stepsHeading: 'How the build goes',
    steps: [
      {
        title: 'We talk through the job',
        body: 'What you will run, what matters most, and the budget. Bring a full parts list or no list at all; both work.',
      },
      {
        title: 'You approve the parts and the price',
        body: 'Every part listed by name, with the flat build fee beside it. Nothing is ordered until you sign off.',
      },
      {
        title: 'We build it clean',
        body: 'Careful assembly with tidy cable management, which helps airflow, makes future upgrades easier, and looks right through a glass panel.',
      },
      {
        title: 'Every build gets burned in',
        body: 'Stress testing pushes the parts hard so a weak component fails on our bench instead of your desk.',
      },
      {
        title: 'It goes home clean and covered',
        body: 'A clean Windows install with no preloaded junk, a one-year manufacturer warranty on the parts, and free diagnostics on the build for life.',
      },
    ],
    cost: {
      heading: 'What it costs',
      lines: [
        'Parts at their real price, plus a flat build fee for the labor. The full quote comes before anything is ordered.',
        'Windows installation and stress testing are included. Every build carries free lifetime diagnostics: if it ever acts up, bring it in and we look at no charge.',
      ],
    },
    symptoms: {
      heading: 'Builds we take on',
      items: [
        'Gaming machines, from esports settings to 4K',
        'Workstations for video editing, 3D work, CAD, and music production',
        'Home and office machines built to last without the markup',
        'Bulk builds for businesses that want consistent machines on every desk',
        'Servers, home labs, and NAS builds',
      ],
    },
    faqs: [
      {
        q: 'I already have a parts list. Can you build it?',
        a: 'Yes. We source, assemble, and test to your exact list, and we flag anything that will not play well together before ordering.',
      },
      {
        q: 'How long does a build take?',
        a: 'It depends on part availability. You get an honest timeline with the quote, and a call if anything changes it.',
      },
      {
        q: 'What if a part fails later?',
        a: 'Parts carry a one-year manufacturer warranty, and the build itself gets free diagnostics for life. Bring it in and we find the problem at no charge.',
      },
    ],
    related: [
      { href: '/computers', label: 'See what we build' },
      { href: '/services/upgrades', label: 'Hardware upgrades' },
    ],
    schemaServiceType: 'Custom Computer Building',
    cta: {
      heading: 'Tell us what you want to build',
      line: 'A detailed spec list or a rough idea both work. Call and we start planning.',
    },
  },

  printers: {
    slug: 'printers',
    name: 'Printers',
    indexLine:
      'Printer repair for any brand, new Brother printers for sale, and in-home setup when you buy one.',
    eyebrow: 'Around the office',
    h1: 'Printer repair, and why we sell Brother',
    answer: [
      'We repair printers from any brand and sell new Brother printers. Repairs start with the $50 diagnostic, which applies toward the work. When a repair would cost more than the printer is worth, we say so before you spend the money.',
    ],
    stepsHeading: 'How a printer repair works',
    steps: [
      {
        title: 'Bring the printer in',
        body: 'Any brand. Describe what it is doing: jams, streaks, error codes, or nothing at all.',
      },
      {
        title: 'The diagnostic sorts it out',
        body: 'Worn rollers, a dying fuser, a driver problem, or a supply lockout. The $50 finds the actual fault.',
      },
      {
        title: 'Fix or replace, said plainly',
        body: 'If the repair beats the cost of a decent new printer, we fix it. If it does not, we tell you, and you decide.',
      },
      {
        title: 'We repair and test',
        body: 'Parts replaced as needed, then test prints before you pick it up.',
      },
    ],
    cost: {
      heading: 'What it costs',
      stamp: { amount: 50, caption: 'diagnostic, applies toward your repair' },
      lines: [
        'Printer repairs are quoted after the diagnostic, and the $50 applies toward the work.',
        'New Brother printers are in stock and available to order. In-home setup is available with any new Brother printer. Call for the current rate.',
      ],
    },
    symptoms: {
      heading: 'When to bring it in',
      items: [
        'Paper jams that keep coming back',
        'Streaks, faded pages, or lines through every print',
        'It will not join the Wi-Fi, or the computer cannot see it',
        'A cryptic error code or a status light that will not clear',
        'It refuses cartridges or will not power on at all',
      ],
    },
    faqs: [
      {
        q: 'Why do you only sell Brother?',
        a: 'They run for years without the constant jams and errors cheaper printers throw, parts stay available so repairs stay reasonable, and they do not fight third-party ink and toner. We sell the printers we would put in our own office.',
      },
      {
        q: 'Is my printer worth fixing?',
        a: 'Sometimes no, and we say so. The diagnostic gives you a real repair number to weigh against a replacement.',
      },
      {
        q: 'What does the in-home setup include?',
        a: 'We come to you, get the printer on your network and your computers, and make sure it prints before we leave. It is available with any new Brother printer. Call for the current rate.',
      },
    ],
    related: [{ href: '/services/recycling', label: 'Recycle the old printer free' }],
    schemaServiceType: 'Printer Repair and Sales',
    cta: {
      heading: 'Bring the printer by',
      line: 'Stop in to see the Brother selection or drop off a printer that needs work.',
    },
  },

  recycling: {
    slug: 'recycling',
    name: 'Electronics recycling',
    indexLine:
      'Drop off old electronics free during business hours. Data destruction guaranteed.',
    eyebrow: 'Around the office',
    h1: 'How free electronics recycling works',
    answer: [
      'Bring your old electronics to the shop during business hours and leave them with us, free. No appointment and no forms. Storage drives are wiped or physically destroyed, so your data is gone for good, and the rest gets recycled through proper channels instead of a landfill.',
    ],
    stepsHeading: 'How it works',
    steps: [
      {
        title: 'Drop it off during business hours',
        body: 'Walk in with it. No appointment, no paperwork, no charge.',
      },
      {
        title: 'We pull the storage',
        body: 'Hard drives and anything else that holds your data come out first.',
      },
      {
        title: 'Drives are destroyed or wiped',
        body: 'Physically destroyed or securely erased. Either way, nothing on them can be recovered.',
      },
      {
        title: 'The rest is recycled properly',
        body: 'Electronics carry lead, mercury, and other materials that do not belong in a landfill. They go through proper recycling channels.',
      },
    ],
    cost: {
      heading: 'What it costs',
      lines: ['Nothing. Recycling drop-off is free, whatever the condition of the equipment.'],
    },
    symptoms: {
      heading: 'What we take',
      items: [
        'Desktops, laptops, servers, and tablets, working or not',
        'Flat-screen TVs and computer monitors',
        'Game consoles from any era',
        'Radios, stereos, VCRs, speakers, and home theater equipment',
        'Keyboards, mice, cables, drives, and loose parts',
        'Vintage electronics: old telephones, ham radios, calculators, typewriters',
      ],
    },
    faqs: [
      {
        q: 'What happens to my data?',
        a: 'Storage devices are physically destroyed or securely wiped. Once we process your device, the data cannot be recovered by anyone.',
      },
      {
        q: 'Do you take tube TVs?',
        a: 'No. We can no longer accept CRT or tube TVs. Flat-screen TVs and monitors are welcome.',
      },
      {
        q: 'Do I need an appointment?',
        a: 'No. Bring it in any time we are open.',
      },
    ],
    related: [{ href: '/services/data-services', label: 'Need the files off it first?' }],
    schemaServiceType: 'Electronics Recycling',
    cta: {
      heading: 'Bring it in',
      line: 'If it has circuits in it, chances are we take it. Call if you are not sure.',
    },
  },
};

/** Hub page grouping, in moneymaker order within the index (repairs first).
 *  Every group holds at least two rows so the index never degrades into
 *  label / one row / label; single-service categories fold into the
 *  nearest neighbor. */
export const SERVICE_GROUPS: { label: string; slugs: ServiceSlug[] }[] = [
  { label: 'Repair', slugs: ['diagnostics', 'virus-removal', 'upgrades', 'laptops', 'desktops'] },
  { label: 'Software', slugs: ['os-installation', 'debloat', 'antivirus'] },
  { label: 'Builds and data', slugs: ['custom-computers', 'data-services'] },
  { label: 'On site and around the office', slugs: ['service-calls', 'printers', 'recycling'] },
];
