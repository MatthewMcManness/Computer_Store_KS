/**
 * ROUTE LOADING STATE - The site-wide fallback Next.js paints while a
 * route's server work is still streaming. On /reviews it is real HTML in
 * the first response, because the reviews cache read is async, so it has
 * to look like the site rather than like a framework default.
 *
 * It is a contained band on the page rhythm, not a full viewport: a
 * min-h-screen box makes every internal navigation jump the scroll
 * position. Colors come from the redesign tokens only. The pulse stops
 * entirely under prefers-reduced-motion.
 *
 * WHEN TO EDIT: When the loading treatment or the page rhythm changes.
 */

/** Renders the site-wide route loading placeholder. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-[60vh] items-center justify-center bg-page px-5 py-24"
    >
      {/* A quiet hairline plate rather than a spinner: it matches the
          rule-and-plate language the rest of the site is built from. */}
      <div className="w-full max-w-sm">
        <div className="h-px w-full bg-line-strong" />
        <div className="mt-6 h-3 w-28 animate-pulse rounded-sm bg-line motion-reduce:animate-none" />
        <div className="mt-4 h-3 w-full animate-pulse rounded-sm bg-line motion-reduce:animate-none" />
        <div className="mt-3 h-3 w-3/5 animate-pulse rounded-sm bg-line motion-reduce:animate-none" />
      </div>
    </div>
  );
}
