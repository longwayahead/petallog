import { useEffect, useState } from "react";

export default function ManagePlantCareModal({
  open,
  onClose,
  plant,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  plant: any;
  onSaved: () => void;
}) {
  const [preferences, setPreferences] = useState<any[]>([]);
  const [originalPrefs, setOriginalPrefs] = useState<any[]>([]); // keep original state for diffing
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !plant?.plantId) return;

    async function loadPrefs() {
      setLoading(true);
      try {
        const [effectsRes, prefsRes] = await Promise.all([
          fetch(`/api/effects`),
          fetch(`/api/plants/${plant.plantId}/preferences`),
        ]);

        if (!effectsRes.ok || !prefsRes.ok) throw new Error("Fetch failed");

        const effects = await effectsRes.json();
        const prefs = await prefsRes.json();

        const merged = effects.map((effect: any) => {
          const pref = prefs.find((p: any) => p.effectID === effect.effectID);
          return pref
            ? { ...effect, ...pref }
            : { ...effect, plantsEffectsID: null, frequencyDays: null };
        });

        setPreferences(merged);
        setOriginalPrefs(merged); // snapshot for comparison
      } catch (err) {
        console.error(err);
        setPreferences([]);
        setOriginalPrefs([]);
      } finally {
        setLoading(false);
      }
    }

    loadPrefs();
  }, [open, plant]);

async function handleSave() {
  if (!plant?.plantId) return;
  setSaving(true);

  try {
    for (const pref of preferences) {
      const original = originalPrefs.find(o => o.effectID === pref.effectID);

      // Add new
      if (!pref.plantsEffectsID && pref.frequencyDays) {
        await fetch(`/api/plants/${plant.plantId}/preferences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            effectID: pref.effectID,
            frequencyDays: pref.frequencyDays,
          }),
        });
      }

      // Update existing
      if (
        pref.plantsEffectsID &&
        pref.frequencyDays !== null &&
        pref.frequencyDays !== original?.frequencyDays
      ) {
        await fetch(`/api/plants/${plant.plantId}/preferences`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plantsEffectsID: pref.plantsEffectsID,
            frequencyDays: pref.frequencyDays,
          }),
        });
      }

      // Delete existing
      if (pref.plantsEffectsID && pref.frequencyDays === null) {
        await fetch(`/api/plants/${plant.plantId}/preferences`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plantsEffectsID: pref.plantsEffectsID,
          }),
        });
      }
    }
    onSaved(); //trigger UI update on profile page
    onClose();
  } catch (err) {
    console.error("Failed to save preferences", err);
    alert("Failed to save changes");
  } finally {
    setSaving(false);
  }
}


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl w-auto max-w-sm p-6 space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold">
          Cr Prfrncs – {plant.plantName}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : preferences.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No care preferences available.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
            {preferences.map((pref) => {
              const active = pref.frequencyDays !== null;

              return (
                <div
                  key={pref.effectID}
                  className={`grid grid-cols-[1fr_auto] items-center py-3 transition ${
                    active ? "" : "opacity-50"
                  }`}
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 pr-4 min-w-[140px]">
                    <div
                      className={`w-8 h-8 ${
                        active ? pref.actionBackground : "bg-gray-200"
                      } rounded-full flex items-center justify-center`}
                    >
                      <i
                        className={`${pref.actionIcon} ${
                          active ? pref.actionColour : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{pref.effectVerb}</div>
                     {active && (
                        <div className="text-xs text-gray-500">
                            {pref.frequencyDays === 1
                            ? "Every day"
                            : `Every ${pref.frequencyDays} days`}
                        </div>
                        )}
                    </div>
                  </div>

                  {/* Editable frequency input */}
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    placeholder="–"
                    value={pref.frequencyDays ?? ""}
                    onChange={(e) =>
                      setPreferences((prev) =>
                        prev.map((p) =>
                          p.effectID === pref.effectID
                            ? {
                                ...p,
                                frequencyDays: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              }
                            : p
                        )
                      )
                    }
                    className="w-16 border rounded px-2 py-1 text-sm text-center"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </button>
          <button
            className="px-3 py-1 rounded bg-emerald-600 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
