import {type Plant} from "../../../types";

export default function Header({ collapsed, plant }: { collapsed: boolean, plant: Plant | null}) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-[60px]">
      {/* Expanded Header */}
      <div
        className={`flex items-center justify-between px-4 h-full transition-opacity duration-300 ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <button className="text-gray-600">
          <i className="fas fa-arrow-left text-lg" />
        </button>
        <h1 className="text-xl font-semibold">Plant Profile</h1>
        <button className="text-gray-600">
          <i className="fas fa-ellipsis-h" />
        </button>
      </div>

      {/* Collapsed Header */}
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
            src={plant?.plantPhoto || `https://placehold.co/32x32/4ade80/white?text=${plant?.plantName.charAt(0)}`}
            alt={plant?.plantName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold">{plant?.plantName}</h2>
          <p className="text-gray-600 text-sm">
            <i>{plant?.species}</i> • {plant?.potName}
          </p>
        </div>
      </div>
    </header>
  );
}