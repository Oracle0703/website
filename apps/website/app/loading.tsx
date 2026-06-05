// Lightweight route-level loading skeleton. Most pages are static so this only
// flashes briefly during navigation/Suspense, but it avoids a blank frame and
// respects reduced-motion.
export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-5">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface/70 motion-reduce:animate-none" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface/60 motion-reduce:animate-none" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-edge bg-surface/50 motion-reduce:animate-none"
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </main>
  );
}
