import { type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type PageHeaderProps = {
  title: string;
  collapsed?: boolean;
  plant?: {
    plantName: string;
    species?: string;
    potName?: string | null;
    plantPhoto?: string | null;
  } | null;
  menuItems?: { label: ReactNode; onClick: () => void }[];
  showBackButton?: boolean; // 🔹 new prop
};

export default function PageHeader({
  title,
  collapsed = false,
  plant,
  menuItems = [],
  showBackButton = true, // default: back button visible
}: PageHeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-[60px] relative">
  {/* Accent line */}
  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

  {/* Expanded Header */}
  <div
    className={`flex items-center justify-between px-4 h-full transition-opacity duration-300 ${
      collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
    }`}
  >
    {/* Left: Back button or placeholder */}
    {showBackButton ? (
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 w-8 text-left"
      >
        <i className="fas fa-arrow-left text-lg" />
      </button>
    ) : (
      <div className="w-8" /> // keeps title centered
    )}

    {/* Center: Title */}
    <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>

    {/* Right: Menu or placeholder */}
    {menuItems.length > 0 ? (
      <div className="relative w-8 text-right" ref={menuRef}>
    <button
      onClick={() => setMenuOpen((o) => !o)}
      className="relative flex items-center justify-center w-8 h-8"
    >
      {/* Ellipsis (shown when menu closed) */}
      <i
        className={`fas fa-ellipsis-h text-gray-600 text-lg absolute transition-all duration-300 ${
          menuOpen ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      />

      {/* Image (shown when menu open, animates up) */}
      <img
        src="/assets/stanley.png"
        alt="Menu"
        className={`w-8 h-8 rounded-full object-cover border absolute transition-all duration-300 ${
          menuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      />
    </button>

    {/* Dropdown menu */}
    <div
      className={`absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg ring-1 ring-black/5 transform transition-all duration-200 origin-top-right ${
        menuOpen
          ? "scale-100 opacity-100"
          : "scale-95 opacity-0 pointer-events-none"
      }`}
    >
      {menuItems.map((item, idx) => (
        <button
          key={idx}
          onClick={() => {
            item.onClick();
            setMenuOpen(false);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>
    ) : (
      <div className="w-8" /> // keeps title centered
    )}
  </div>

  {/* Collapsed Header (for plant profile) */}
  {plant && (
    <div
      className={`absolute inset-0 transition-opacity transition-transform duration-300 flex items-center px-4 ${
        collapsed
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
      style={{ height: "60px" }}
    >
      <div className="w-8 h-8 rounded-full bg-green-100 overflow-hidden flex items-center justify-center mr-3">
        <img
          src={
            plant.plantPhoto ||
            `https://placehold.co/32x32/4ade80/white?text=${plant.plantName?.[0]}`
          }
          alt={plant.plantName}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="font-semibold">{plant.plantName}</h2>
        <p className="text-gray-600 text-sm">
          <i>{plant.species}</i>
          {plant.potName ? ` • ${plant.potName}` : ""}
        </p>
      </div>
    </div>
  )}
</header>

  );
}
