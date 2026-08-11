/**
 * OPEN NOW CHIP - Small status chip computed from the real store hours
 * (BUSINESS_INFO.hoursDetailed) in Topeka time. Brand blue only — the
 * brief bans green everywhere, including "open" dots.
 *
 * Client component: the status depends on the visitor's clock, so it
 * renders nothing on the server and fills in after mount (avoids a
 * hydration mismatch on cached pages).
 *
 * WHEN TO EDIT: When changing the chip design. Hours themselves live in
 * src/lib/constants.ts.
 */
'use client';

import { useEffect, useState } from 'react';
import { BUSINESS_INFO } from '@/lib/constants';
import { cn } from '@/lib/cn';

type DayKey = keyof typeof BUSINESS_INFO.hoursDetailed;

interface OpenNowChipProps {
  className?: string;
}

/** Formats "18:00" as "6 pm" / "10:30" as "10:30 am". */
function formatTime(t: string): string {
  const h = Number(t.split(':')[0] ?? 0);
  const m = Number(t.split(':')[1] ?? 0);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = ((h + 11) % 12) + 1;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

/** Gets the current weekday key and "HH:MM" time in Topeka (America/Chicago). */
function topekaNow(): { day: DayKey; time: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = get('weekday').toLowerCase() as DayKey;
  // hour12:false can yield "24" for midnight in some engines; normalize
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { day, time: `${hour}:${get('minute')}` };
}

/** Renders "Open now until X" or "Closed now" from the real store hours. */
export function OpenNowChip({ className }: OpenNowChipProps) {
  const [label, setLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  /* Re-checked every minute. Computing this once at mount left a tab
     open across closing time still reading "Open now until 6 pm", and
     the chip is exactly the thing someone reads while deciding whether
     to drive over. The null-until-mounted guard stays, so the server
     render is still empty and there is still no hydration mismatch. */
  useEffect(() => {
    const compute = () => {
      const { day, time } = topekaNow();
      const today = BUSINESS_INFO.hoursDetailed[day];
      if (today && !today.closed && time >= today.open && time < today.close) {
        setOpen(true);
        setLabel(`Open now until ${formatTime(today.close)}`);
      } else {
        setOpen(false);
        setLabel('Closed now');
      }
    };
    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!label) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold tabular-nums',
        open ? 'bg-tint text-brand-deep' : 'bg-surface text-muted',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-2 w-2 rounded-full', open ? 'bg-brand' : 'bg-line-strong')}
      />
      {label}
    </span>
  );
}
