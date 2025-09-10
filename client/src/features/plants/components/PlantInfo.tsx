import React from "react";
import type { Preference } from "../../../types";

interface PlantInfoProps {
  open: boolean;
  onToggle: () => void;
  preferences: Preference[];
  notes: string;
}

export default function PlantInfo({
  open,
  onToggle,
  preferences,
  notes,
}: PlantInfoProps) {
  return (
    <>
      <button
        className="w-full flex items-center justify-between"
        onClick={onToggle}
      >
        <h3 className="font-semibold">Care Information</h3>
        <i
          className={`fas ${
            open ? "fa-chevron-up" : "fa-chevron-down"
          } text-gray-400 transition-transform`}
        />
      </button>

      <div
        className={`transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-2 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            {preferences.map((pref) => (
              <div key={pref.plantsEffectsID} className="flex items-center">
                {/* Representative icon/color from linked action */}
                <i className={`${pref.actionIcon} ${pref.actionColour} mr-2`} />

                {/* Show effect name + frequency */}
                <span>
                  {pref.effectVerb} every{" "}
                  {pref.frequencyDays > 1
                    ? `${pref.frequencyDays} days`
                    : "day"}
                </span>
              </div>
            ))}
          </div>

          {notes && <p className="mt-2">{notes}</p>}
        </div>
      </div>
    </>
  );
}
