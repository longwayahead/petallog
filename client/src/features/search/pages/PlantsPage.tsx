// src/features/search/pages/SearchPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../ui/TopNav";


type Plant = {
  plantId: number;
  plantName: string;
  species: string;
  potName: string | null;
  plantPhoto: string | null;
};

export default function SearchPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPlants() {
      try {
        const res = await fetch("/api/plants/");
        if (!res.ok) throw new Error("Failed to fetch plants");
        const data = await res.json();
        setPlants(data);
      } catch (err) {
        console.error(err);
        setPlants([]);
      } finally {
        setLoading(false);
      }
    }
    loadPlants();
  }, []);

  const filtered = plants.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.plantName.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q) ||
      (p.potName?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <main className="app-root app-container mx-auto max-w-md bg-white text-gray-800 flex flex-col h-screen">
  <PageHeader title="Search" showBackButton={false} />

  {/* Search bar */}
  <div className="p-1 pr-4 pl-4">
    <div className="relative">
      <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder="Search plants or pots…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  </div>

  {/* Content area with spinner alignment */}
  <div className="flex-1 overflow-y-auto pb-16">
    {loading ? (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : (
      <>
        {filtered.length === 0 && (
          <p className="px-4 text-gray-500">No plants found</p>
        )}
        <ul className="divide-y divide-gray-200">
          {filtered.map((plant) => (
            <li
              key={plant.plantId}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/plants/${plant.plantId}`)}
            >
              <img
                src={
                  plant.plantPhoto ||
                  `https://placehold.co/48x48/ccc/fff?text=${plant.plantName[0]}`
                }
                alt={plant.plantName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-3 flex-1 min-w-0">
                <div className="font-medium truncate">{plant.plantName}</div>
                <div className="text-sm text-gray-500 truncate">
                  <i>{plant.species}</i>
                  {plant.potName ? ` • ${plant.potName}` : ""}
                </div>
              </div>
              <i className="fas fa-chevron-right text-gray-400 ml-2" />
            </li>
          ))}
        </ul>
      </>
    )}
  </div>
</main>

  );
}
