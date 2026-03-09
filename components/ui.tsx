// Loading Skeleton
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex gap-4">
        {[60, 200, 50, 50, 50, 50, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-gray-200 rounded animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
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
              className="h-3 bg-gray-100 rounded animate-pulse hidden sm:block"
              style={{ width: w }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card Grid Skeleton
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}

// Match Card Skeleton
export function MatchCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4"
        >
          <div className="flex justify-between">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-11 h-11 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="flex flex-col items-center gap-2 flex-1">
              <div className="w-11 h-11 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Error message
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">⚠️</div>
      <div className="text-red-600 font-semibold">{message}</div>
      <div className="text-red-400 text-sm mt-1">Sahifani yangilab ko'ring</div>
    </div>
  );
}

// Empty state
export function EmptyState({
  message = "Ma'lumot topilmadi",
}: {
  message?: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
      <div className="text-5xl mb-4">⚽</div>
      <div className="text-gray-500 font-medium">{message}</div>
    </div>
  );
}
