import PageHeader from "../../../ui/TopNav";

export default function FeedPage() {
  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800">
      <PageHeader title="Home" showBackButton={false} />

      {/* Feed content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Placeholder skeletons */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-3 animate-pulse"
            >
              {/* Avatar circle */}
              <div className="w-12 h-12 rounded-full bg-gray-200" />

              {/* Text lines */}
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}

          <p className="text-center text-gray-400 text-sm pt-6">
            Latest interactions feed (coming soon)…
          </p>
        </div>
      </div>
    </main>
  );
}
