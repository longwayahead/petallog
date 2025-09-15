// src/features/plants/pages/PlantProfilePage.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { ApiInteraction, Preference, Plant, Task, Action, Photo } from "../../../types";
import { useTabs } from "../../../hooks/useTabs";
import { usePagerSwipe } from "../../../hooks/swipe/usePageSwipe";
import {useInteractions} from "../hooks/useInteractions";
import { actionHandlers } from "../../../lib/actionController";



// import Header from "../components/Header";
import PageHeader from "../../../ui/TopNav";
import QuickActions from "../components/QuickActions";
import ConfirmDeleteModal from "../components/Modals/ConfirmDeleteModal";
import PlantSummary from "../components/PlantSummary";
import PendingTaskBanner from "../components/PendingTaskBanner";
import PlantInfo from "../components/PlantInfo";
import PlantTabs from "../components/PlantTabs";
import {createScannerPromise} from "../../../lib/scannerBridge";
import CameraCaptureOverlay from "../components/CameraCaptureOverlay";
import PhotoModal from "../components/Modals/PhotoModal";
import ManagePlantCareModal from "../components/Modals/ManagePlantCareModal";
import EditPlantModal from "../components/Modals/EditPlantModal";
import ScanScreen from "../../scanner/pages/ScanScreen";
import {actionsApi} from "../../../lib/potService"; 




// simple debounce util
function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function PlantProfilePage() {
  const { plantId } = useParams<{ plantId: string }>();

  // 🔹 State
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);

  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [infoOpen, setInfoOpen] = useState(false);

  const navigate = useNavigate();


  // Header collapse
  const [collapsed, setCollapsed] = useState(false);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // console.log("Setting up scroll listener");
  const ca = contentAreaRef.current;
  if (!ca) return;
//   console.log("contentAreaRef.current:", ca);
// console.log("is scrollable?", ca.scrollHeight, ca.clientHeight);
  const onScroll = () => {
  setCollapsed(ca.scrollTop > 60); // e.g. 100px scroll
};

  ca.addEventListener("scroll", onScroll);
  return () => ca.removeEventListener("scroll", onScroll);
}, [loading]); //rerun after page loaded


const loadPreferences = useCallback(async () => {
      try {
        const res = await fetch(`/api/plants/${plantId}/preferences`);
        if (!res.ok) throw new Error("Failed to fetch preferences");
        const data = await res.json();
        setPreferences(data);
      } catch (err) {
        console.error("Failed to load preferences", err);
        setPreferences([]);
      }
    }, [plantId]);


  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);


const { items, setItems, addTimelineCard, mapApiToInteraction } = useInteractions();

  // 🔹 Editing + modals
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollPositions = useRef<{ [key: number]: number }>({});


const handleShow = (i: number) => {
  const content = contentAreaRef.current;
  // console.log(topRef.current?.scrollHeight);
  if (content) {
    if (content.scrollTop > (topRef.current?.scrollHeight || 0)) {

      scrollPositions.current[active] = topRef.current?.scrollHeight || 0;
      
    }
    // console.log("Saving", { tab: active, value: content.scrollTop });
  }
  show(i);
  setEditingId(null);
};



  // 🔹 Tabs + swipe
  const timelineRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const { active, show, containerRef, wrapperRef, indicatorRef } = useTabs(
    [timelineRef, galleryRef], topRef
  );







  const { bind: pagerBind } = usePagerSwipe({
    index: active,
    count: 2,
    onIndexChange: handleShow,
    wrapperRef,
    minCommit: 50,
  });


  const [cameraFor, setCameraFor] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Cancel editing when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {

      const target = e.target as HTMLElement;

      if (target.closest(".camera-overlay") || target.closest(".photo-modal")) {
        return; // ignore clicks when in the overlays
      } 

      if (!target.closest(".interaction-card")) {
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cameraFor, selectedPhoto]);





const loadPlant = useCallback(async () => {
  try {
    const response = await fetch(`/api/plants/${plantId}`);
    if (!response.ok) throw new Error("Failed to fetch plant");
    const data = await response.json();
    setPlant(data);
  } catch (err) {
    console.error("Failed to load plant", err);
    setError("Failed to load plant");
  } finally {
    setLoading(false);
  }
}, [plantId]);

  // Load plant
  useEffect(() => {
    if (plantId) loadPlant();
  }, [plantId]);

  //load tasks from api
  const loadTasks = useCallback(async () => {
  if (!plantId) return;
  try {
    const res = await fetch(`/api/plants/${plantId}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const data: Task[] = await res.json();
    setPendingTasks(data);
  } catch (err) {
    console.error("Failed to load tasks", err);
    setPendingTasks([]);
  }
}, [plantId]);
  
  //  Load tasks from API on mount
useEffect(() => {
  loadTasks();
}, [loadTasks]);

  // Load interactions from API
const location = useLocation();

// after setting items (in loadInteractions effect)
useEffect(() => {
  if (!plantId) return;

  async function loadInteractions() {
    try {
      const res = await fetch(`/api/plants/${plantId}/interactions`);
      if (!res.ok) throw new Error("Failed to fetch interactions");
      const data: ApiInteraction[] = await res.json();
      const mappedItems = data.map(mapApiToInteraction);
      setItems(mappedItems);

      // 🔹 Wait a tick so DOM renders cards
      setTimeout(() => {
        // console.log("Checking for hash", location.hash);
        if (location.hash) {
          const el = document.querySelector(location.hash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            //can open the card with the below...
            // setEditingId(location.hash.includes("i-") ? location.hash.replace("#i-", "") : null);
          }
        }
      }, 50);
    } catch (err) {
      console.error("Failed to load interactions", err);
      setItems([]);
    }
  }

  loadInteractions();
}, [plantId, location.hash]);

// set actions in the actions bar
const [actions, setActions] = useState<Action[]>([]);
useEffect(() => {
  async function loadActions() {
    try{
      const res = await fetch("/api/actions");
      if (!res.ok) throw new Error ("Failed to fetch actions");
      const data = await res.json();

      

      setActions(data);

    } catch (err) {
      console.error("Failed to load actions", err)
      setActions([])
    }
  }
  loadActions();
}, []);

async function setProfilePhoto(plantId: string, photoId: string) {
  if (!plant) return;
  // console.log(plantId, photoId);
  const res = await fetch(`/api/plants/${plantId}/photo/${photoId}`, {
    method: "PATCH",
  });

  if (res.ok) {
    const updatedPlant = await res.json();
    setPlant(updatedPlant); // overwrites local state
  }
}





  // Interaction editing helpers
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
const debouncedSync = useCallback( //live note update
  debounce(async (id: string, text: string) => {
    try {
      const res = await fetch(`/api/interactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      });
      if (!res.ok) throw new Error("Failed to update note");
    } catch (err) {
      console.error("Failed to sync note", err);
    }
  }, 1000),
  []
);

const updateNote = (id: string, text: string) => {
  // 1. Update local state immediately
  setItems(list =>
    list.map(it => it.id === id ? { ...it, note: text } : it)
  );

  // 2. Schedule debounced server sync
  debouncedSync(id, text);
};

  const requestDelete = (id: string) => {
    const interaction = items.find(it => it.id === id);
    if (!interaction) return;
    if (interaction.photos.length > 0) {
      alert("Cannot delete interaction with photos.");
      return;
    } 
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;

    // Optimistic update
    const backup = items;
    setItems(list => list.filter(it => it.id !== confirmDeleteId));

    try {
      const res = await fetch(`/api/interactions/${confirmDeleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete interaction");
    } catch (err) {
      console.error(err);
      setItems(backup); // rollback
    } finally {
      setConfirmDeleteId(null);
    }
  };



const onAddPhoto = (id: string) => {
  setCameraFor(id);   // open camera overlay for this interaction
};

const [refreshGallery, setRefreshGallery] = useState(0);
const handleCapture = async (file: File, thumbUrl?:string) => {
  if (!cameraFor) return;

  //create temporary photo
  const tempPhoto: Photo = {
    id: `temp-${Date.now()}`,
    url: "",
    thumbnail_url: thumbUrl || "",
    created_at: new Date().toISOString(),
    interaction_id: cameraFor,
    pending: true,
  };
  //show this immediately
  setItems(items =>
    items.map(it =>
      it.id === cameraFor ? { ...it, photos: [tempPhoto, ...it.photos] } : it
    )
  );

  //upload photo
  const form = new FormData();
  form.append("photos", file, "capture.jpg");
  
  try {
    const res = await fetch(`/api/interactions/${cameraFor}/photos`, {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const newPhotos : Photo[] = await res.json();
      setItems(items =>
        items.map(it =>
          it.id === cameraFor 
          ? { 
            ...it,
            photos: [
              ...newPhotos,
              ...it.photos.filter(p => !p.pending) //keep existing non-pending photos
            ].filter((p, idx, arr) =>
            arr.findIndex(pp => pp.id === p.id) === idx
            ), //deduplicate
          }
        : it
        )
      );
      setRefreshGallery(prev=>prev+1);
    } else { //if upload fails, remove pending photo
      setItems(items =>
        items.map(it =>
          it.id === cameraFor
          ? { 
            ...it,
            photos: it.photos.filter(p => !p.pending),
          }
          : it
        )
      );
    }
  } catch (err) {
    console.error("Failed to upload photo", err);
    //remove pending photo
    setItems(items =>
      items.map(it =>
        it.id === cameraFor
          ? {
              ...it,
              photos: it.photos.filter(p => !p.pending),
            }
          : it
      )
    );
  }
  setCameraFor(null);
};

const handleDeletePhoto = async (photoId: string) => {
  if (!photoId) return;
  console.log("Deleting photo", photoId);
  
  //optimistically remove the photo
  const backup = items;
  setItems(items =>
    items.map(it => ({
      ...it,
      photos: it.photos.filter(p => p.id !== photoId),
    }))
  );
  setSelectedPhoto(null);
  //actually delete on server
  try{
    const res = await fetch(`/api/photos/${photoId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete photo");
  } catch (err) {
    console.error(err);
    setItems(backup); // rollback
  } finally {
    setSelectedPhoto(null);
  }
}

const [scannerOpen, setScannerOpen] = useState(false);
const [scannerHeading, setScannerHeading] = useState("Scan a pot");

const [plantCareFormOpen, setPlantCareFormOpen] = useState(false);
const [plantDetailsFormOpen, setPlantDetailsFormOpen] = useState(false);

  return (
    <div className="mx-auto max-w-md bg-white text-gray-800">
      <PageHeader
        title="Plant Profile"
        collapsed={collapsed}
        plant={
          plant && {
            plantName: plant.plantName,
            species: plant.species,
            potName: plant.potName,
            plantPhoto: plant.plantPhoto,
          }
        }
        menuItems={[
          { label: "plnt dtls", onClick: () => setPlantDetailsFormOpen(true) },
          { label: "cr prfrncs", onClick: () => setPlantCareFormOpen(true) },
          
          // { label: "Delete Plant", onClick: () => setConfirmDeleteId(plant?.plantId.toString() ?? null) },
        ]}
      />

      {loading ? (
<div className="flex items-center justify-center h-[calc(100vh-60px-56px)]">
    <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
  ) : (
    <>

        {/* Scrollable content */}
        <div
          ref={contentAreaRef}
          className="
      content-area overflow-y-auto h-[calc(100vh-60px)]
      pb-0 sm:pb-[calc(56px+env(safe-area-inset-bottom,0px))]
    "
        >
          <div className="p-4"
          ref={topRef}
          >
            {!loading && !error && plant && <PlantSummary plant={plant} />}

            {pendingTasks.length > 0 && <PendingTaskBanner tasks={pendingTasks} />}
            {plant?.plantAlive == true && (
            <QuickActions
              actions={actions}
              onAdd={async (actionId: number) => {
                if (!plantId || !plant?.potId) return;

                const cfg = actions.find((a) => a.actionID === actionId);
                if (!cfg) return;

                const handler = actionHandlers[cfg.actionFlow]; //connect to actionController
                if (!handler) return;

                await handler(cfg, {
                  plant: plant,
                  plantId,
                  currentPotId: plant.potId,
                  addTimelineCard,
                  openScanner: async (heading?: string) => {
                    const promise = createScannerPromise();
                    setScannerOpen(true);
                    setScannerHeading(heading || "Scan a pot");
                    return promise;
                  },
                  openCamera: async () => ["/photos/example.jpg"],
                  chooseLocation: async () => "location-123",
                  navigateTo: (path) => navigate(path),
                  api: actionsApi, // 👈 now comes from potService
                });
                await loadPlant();
                await loadTasks();
                //switch to timeline
                show(0);
                
              }}
            />
            )}

            <PlantInfo
              open={infoOpen}
              onToggle={() => setInfoOpen((o) => !o)}
              preferences={preferences}
              notes={plant?.plantNotes || ""}
              
            />
          </div>

          {/* Tabs */}
          <PlantTabs
            items={items}
            editingId={editingId}
            onLongPress={(id) => setEditingId(id)}
            onUpdateNote={(id, text) => updateNote(id, text)}
            textareaRefs={textareaRefs}
            onDelete={requestDelete}
            onAddPhoto={onAddPhoto}
            onCardClick={(id) => {
              if (editingId && editingId !== id) setEditingId(null);
            }}
            onDoneEditing={() => setEditingId(null)}
            active={active}
            show={handleShow}
            timelineRef={timelineRef}
            galleryRef={galleryRef}
            containerRef={containerRef}
            wrapperRef={wrapperRef}
            indicatorRef={indicatorRef}
            pagerBind={pagerBind}
            plantId={plantId ?? ""}
            onSelectPhoto={setSelectedPhoto}
            refreshGallery={refreshGallery}
            plant={plant ? plant : null}
            //#

          />
        </div>
      </>
      )}

      {/* Delete modal */}
      <ConfirmDeleteModal
        open={!!confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        // onChange={onFileChange}
      />
      {cameraFor && <CameraCaptureOverlay onCapture={handleCapture} onCancel={() => setCameraFor(null)} />}
      <PhotoModal
        photo={selectedPhoto}
        currentProfilePicture={plant?.plantPhoto || null}
        onClose={() => setSelectedPhoto(null)}
        onDelete={handleDeletePhoto}
        onSetProfilePhoto={(photoId: string) => {
          if (plant?.plantId && photoId) {
            setProfilePhoto(plant.plantId, photoId);
          }
          setSelectedPhoto(null);
        }}
        plant={plant || null}
      />

      <ManagePlantCareModal
        open={plantCareFormOpen}
        onClose={() => setPlantCareFormOpen(false)}
        plant={plant}
        onSaved={loadPreferences}
      />
      <EditPlantModal
        open={plantDetailsFormOpen}
        onClose={() => setPlantDetailsFormOpen(false)}
        plant={plant}
        onSaved={loadPlant}
      />
      <ScanScreen
        open={scannerOpen}
        heading={scannerHeading}
        onClose={() => setScannerOpen(false)}
      />
    </div>
    
  );
}
