/**
 * REPAIR BAND - The volume trust line on the homepage: editorial
 * service index rows on the blue wash, each a full-width hairline-ruled
 * row with a plain one-line description. The diagnostics row leads with
 * the $50 price stamp; every other row carries the pricing model that
 * actually applies to that job.
 *
 * WHEN TO EDIT: When adding or rewording a repair line on the homepage.
 * Full service details live under /services.
 */

import { Section, Eyebrow, CTALink, PriceStamp } from '@/components/ui';

/**
 * How a row is priced. Four states, because the shop prices four ways:
 *
 * - `stamp`   the $50 diagnostic, the one fixed price documented today
 * - `flat`    a job that is always the same, so it runs at a flat rate.
 *             docs/profile/services.md names laptop and desktop blowout,
 *             CPU repaste, and cooler installs. The numbers are not
 *             documented yet, so the row says to call for the price and
 *             the number drops in here when Max confirms it.
 * - `quoted`  everything else: quoted after the diagnostic
 * - `ask`     advice rather than a repair, where quoting a diagnostic
 *             fee would misdescribe the job
 */
type RepairPricing = 'stamp' | 'flat' | 'quoted' | 'ask';

/** The right-rail label for every pricing state except the stamp. */
const PRICING_LABEL: Record<Exclude<RepairPricing, 'stamp'>, string> = {
  flat: 'Flat rate, call for the price',
  quoted: 'Quoted after diagnosis',
  ask: 'Call and ask',
};

interface RepairRow {
  /** Service name shown at h3 scale */
  name: string;
  /** One plain sentence describing the job */
  description: string;
  /** How the job is priced. Defaults to 'quoted'. */
  pricing?: RepairPricing;
}

const ROWS: RepairRow[] = [
  {
    name: 'Diagnostics',
    description:
      'Every repair starts here. We find the actual problem and quote the fix before any work happens.',
    pricing: 'stamp',
  },
  {
    name: 'Virus and scam checks',
    description:
      'Clicked something suspicious? Bring it in. We clean the machine and tell you straight what happened.',
  },
  {
    name: 'Upgrades',
    description:
      'Memory, storage, graphics. We fit the right part to the machine you already own.',
  },
  {
    name: 'Blowout cleaning',
    description:
      'Dust kills computers slowly. We open the case and clean it out the right way.',
    pricing: 'flat',
  },
  {
    name: 'Windows 11 help',
    description:
      'We check whether your machine can make the move, carry your files over, and walk you through what changed.',
    pricing: 'ask',
  },
  {
    name: 'Data services',
    description:
      'Transfers, backups, and getting your files off a machine that will not start.',
  },
];

/** Renders the in-house repair index rows with the diagnostic price stamp. */
export function RepairBand() {
  return (
    <Section tone="wash" rhythm="standard" aria-labelledby="repair-heading">
      <Eyebrow>Fixed in-house</Eyebrow>
      <h2 id="repair-heading" className="mt-4">
        Repairs, done in-house
      </h2>
      <p className="mt-5 max-w-[56ch] text-lede">
        Your machine stays at the shop from drop-off to pickup, and so does
        your data.
      </p>

      {/* Three columns, so every hairline terminates in a real element
          instead of running a third of the container into nothing. The
          right cell carries the diagnostic stamp on the one row with a
          published price, and the pricing model that actually applies on
          the rest. Blowout cleaning is a flat-rate job in
          docs/profile/services.md, so calling it "quoted after diagnosis"
          contradicted /services two clicks away, and a Windows 11
          compatibility check is counter advice rather than a repair, so
          it does not sit behind a diagnostic fee either. */}
      <div className="mt-12 border-b border-line">
        {ROWS.map((row) => {
          const pricing = row.pricing ?? 'quoted';
          return (
            <div
              key={row.name}
              className="grid items-baseline gap-x-8 gap-y-3 border-t border-line py-6 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)_16rem]"
            >
              <h3 className="text-xl">{row.name}</h3>
              <p className="max-w-[52ch]">{row.description}</p>
              <div className="sm:col-span-2 lg:col-span-1 lg:justify-self-end lg:text-right">
                {pricing === 'stamp' ? (
                  <PriceStamp amount={50} caption="applies toward your repair" size="sm" />
                ) : (
                  <span className="text-eyebrow uppercase text-muted">
                    {PRICING_LABEL[pricing]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <CTALink href="/services" variant="quiet">
          See every service and how pricing works
        </CTALink>
      </div>
    </Section>
  );
}
