export function NotificationsHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-[60px] flex items-center justify-between px-4">
      <button className="text-gray-600">
        <i className="fas fa-arrow-left text-lg" />
      </button>
      <h1 className="text-xl font-semibold">Tasks</h1>
      <button className="text-gray-600">
        <i className="fas fa-ellipsis-h" />
      </button>
    </header>
  );
}
