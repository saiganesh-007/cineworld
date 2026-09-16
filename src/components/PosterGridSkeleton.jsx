// ==========================================
// POSTER GRID SKELETON
// Dark pulsing placeholder cards matching
// MovieCard dimensions while saved items load.
// ==========================================

function PosterGridSkeleton({ count = 6 }) {
  return (
    <div
      role="status"
      aria-label="Loading saved items"
      className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="rounded-lg bg-zinc-900 h-48 sm:h-52 md:h-56 border border-white/5" />

          <div className="mt-2 space-y-2 px-0.5">
            <div className="h-3 w-3/4 rounded bg-zinc-900" />
            <div className="h-2.5 w-2/5 rounded bg-zinc-900/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PosterGridSkeleton;