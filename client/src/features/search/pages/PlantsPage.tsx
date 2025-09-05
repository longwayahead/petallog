export default function SearchPage() {
  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800 pb-16">
      <header className="sticky top-0 z-10 bg-white border-b px-4 h-[56px] flex items-center">
        <h1 className="text-lg font-semibold">Search</h1>
      </header>
      <div className="p-4">
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Search plants or pots…" />
      </div>
    </main>
  );
}
