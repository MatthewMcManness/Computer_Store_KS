/**
 * COVERAGE LIST - The hairline-ruled list of everything the Silver plan
 * includes, taken from the live plan content. No cards, no icons.
 *
 * The eleven items are grouped into two labelled blocks rather than
 * split 6/5 across an unlabelled two-column grid: an odd split left an
 * empty bottom-right cell and two column rules ending at different
 * heights, which read as an alignment failure. Every rule in the block
 * now spans its own column, opening and closing rules included.
 *
 * PRICING GATE: the shape brief keeps plan pricing off this page until
 * Max confirms the recurring price and its terms (open question 3).
 * Until then the closing line is the call-for-pricing pattern. If Max
 * confirms, restore the price WITH its commitment terms stated beside it.
 *
 * WHEN TO EDIT: When plan coverage changes, or when Max confirms the
 * public plan price. List only what the shop actually sells; never
 * invent coverage.
 */

import { Section, PhoneLink } from '@/components/ui';

const COVERAGE_GROUPS = [
  {
    label: 'Included every month',
    items: [
      'Antivirus software included',
      'Remote support, four hours a month',
      'Performance monitoring and alerts',
      'Free in-store diagnostics',
      'Email support with a 24 to 48 hour response',
      'A system health check every quarter',
    ],
  },
  {
    label: 'Discounts and priority',
    items: [
      '50% off virus removal',
      '50% off house calls',
      '50% off account recovery',
      '15% off labor',
      'Priority scheduling',
    ],
  },
] as const;

/** Renders the grouped coverage list with the call-for-pricing close. */
export function CoverageList() {
  return (
    <Section tone="page" rhythm="generous" aria-labelledby="coverage-heading">
      <h2 id="coverage-heading">What the plan covers</h2>
      <p className="mt-5 max-w-[56ch] text-lede">
        Everything on this list comes with the plan, on every covered
        machine.
      </p>

      {/* Six items beside five: the shorter column's closing rule used to
          stop 60-odd pixels above its neighbour's, which reads as an
          alignment failure rather than as two lists of different lengths.
          Both columns fill the row's height and the slack is shared out
          across the rows, so every rule in the block is evenly pitched
          and the two lists open and close together. Same construction as
          the paired lists on /about. */}
      <div className="mt-12 grid gap-x-16 gap-y-12 md:grid-cols-2">
        {COVERAGE_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col">
            <p className="text-eyebrow uppercase text-brand-deep">{group.label}</p>
            <ul className="mt-4 flex flex-1 flex-col border-t border-line">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex flex-1 items-center border-b border-line py-4 font-medium text-ink"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 border-t border-line-strong pt-6">
        <p className="max-w-[56ch] text-lg font-semibold text-ink">
          The plan is priced per device, per month.
        </p>
        <p className="mt-3 max-w-measure text-muted">
          Call the shop, tell us how many machines you run, and we will
          give you the number before anything starts.
        </p>
        <div className="mt-6">
          <PhoneLink label="Call for the price" />
        </div>
      </div>
    </Section>
  );
}
