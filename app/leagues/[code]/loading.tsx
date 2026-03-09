// app/leagues/[code]/loading.tsx
export default function LeagueLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="h-36 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="flex gap-2">
        {[80, 100, 90].map((w, i) => (
          <div
            key={i}
            className="h-10 bg-gray-100 rounded-xl animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-3 flex gap-4 items-center border-b border-gray-50"
          >
            <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-3 bg-gray-100 rounded animate-pulse flex-1 max-w-48" />
            {[40, 40, 40, 40, 50].map((w, j) => (
              <div
                key={j}
                className="h-3 bg-gray-100 rounded animate-pulse"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
