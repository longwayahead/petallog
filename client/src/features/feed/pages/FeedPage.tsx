import { useEffect, useState, useRef } from "react";
import PageHeader from "../../../ui/TopNav";
import { fuzzyDate } from "../../../utils/date";
import PhotoModal from "../../plants/components/Modals/PhotoModal";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const limit = 20;

  const [modalPhoto, setModalPhoto] = useState<any | null>(null);

  const loadFeed = async ({ reset = false } = {}) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/interactions/feed?limit=${limit}&offset=${
          reset ? 0 : offsetRef.current
        }`
      );
      const data = await res.json();

      if (reset) {
        setFeed(data);
        offsetRef.current = data.length;
      } else {
        setFeed((prev) => [...prev, ...data]);
        offsetRef.current += data.length;
      }

      if (data.length < limit) setHasMore(false);
      else setHasMore(true);
    } catch (err) {
      console.error("Failed to load feed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed({ reset: true });
  }, []);

  // Group consecutive interactions by plant
  const groupedFeed: any[] = [];
  let currentGroup: any | null = null;

  feed
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .forEach((item) => {
      if (
        currentGroup &&
        currentGroup.plant.id === item.plantID
      ) {
        currentGroup.interactions.push(item);
      } else {
        if (currentGroup) groupedFeed.push(currentGroup);
        currentGroup = {
          plant: {
            id: item.plantID,
            name: item.plantName,
            species: item.plantSpecies,
            thumb:
              item.plantPhotoThumbnailURL ||
              `https://placehold.co/48x48/ccc/fff?text=${item.plantName[0]}`,
          },
          interactions: [item],
        };
      }
    });
  if (currentGroup) groupedFeed.push(currentGroup);

  return (
    <div className="mx-auto max-w-md bg-gray-50 text-gray-800 min-h-screen">
      <PageHeader title="Home" showBackButton={false} />

      <div className="p-4 space-y-6 pb-20">
        {groupedFeed.map((group, idx) => (
          <div
            key={`${group.plant.id}-${idx}`}
            className="bg-white shadow-sm rounded-xl p-4"
          >
            {/* Plant header */}
            <a href={`/plants/${group.plant.id}`} className="no-underline text-inherit">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={group.plant.thumb}
                alt={group.plant.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <div className="font-semibold text-lg">{group.plant.name}</div>
                <div className="text-sm text-gray-500">
                  {group.plant.species}
                </div>
              </div>
            </div>
            </a>

            {/* Interactions under this plant */}
            <div className="space-y-3 pl-4 border-l-2 border-gray-100">
              {group.interactions.map((item: any) => (
                <div
                  key={item.interactionID}
                  className="cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/plants/${item.plantID}#i-${item.interactionID}`)
                  }
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-7 h-7 ${item.actionBackground} rounded-full flex items-center justify-center`}
                    >
                      <i className={`${item.actionIcon} ${item.actionColour}`} />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{item.actionNamePast}</span>
                      {item.interactionNote && (
                        <span className="ml-1 text-gray-600">
                          – {item.interactionNote}
                        </span>
                      )}
                      <div className="text-xs text-gray-400">
                        {fuzzyDate(item.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Photos */}
                  {item.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 ml-9">
                      {item.photos.map((p: any) => (
                        <img
                          key={p.id}
                          src={p.thumbnail_url}
                          className="w-full aspect-square object-cover rounded cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPhoto(p);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-gray-400 text-sm">Loading…</div>
        )}
        {!hasMore && !loading && (
          <div className="text-center text-gray-400 text-sm">
            No more items
          </div>
        )}
      </div>

      {/* Photo modal */}
      {modalPhoto && (
        <PhotoModal
          photo={modalPhoto}
          onClose={() => setModalPhoto(null)}
          plant={null}
        />
      )}
    </div>
  );
}
