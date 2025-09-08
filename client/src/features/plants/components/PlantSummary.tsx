import React from "react";
import  type { Plant } from "../../../types";

export default function PlantSummary({ plant }: { plant: Plant }) {
  // console.log(plant.diedAt);
  const diedAt = new Date(plant.diedAt!).toLocaleDateString("en-IE", { month: "short", year: "numeric" });
  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-24 h-24 rounded-full bg-green-100 overflow-hidden flex items-center justify-center">
        <img
          src={plant.plantPhoto || `https://placehold.co/100x100/4ade80/white?text=${plant.plantName.charAt(0)}`}
          alt={plant.plantName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">{plant.plantName}</h2>
        <p className="text-gray-600">
          <i>{plant.species}</i>
        </p>
        <div className="flex mt-2 space-x-3 text-sm text-gray-500">
          <div className="flex items-center">
            <i className="fas fa-seedling mr-1" />
            <span>
              {new Date(plant.acquiredAt).toLocaleDateString("en-IE", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <span>
            {!plant.plantAlive ? ( // show skull + diedAt when NOT alive
              <>
                <i className="fas fa-skull mr-1" />
                {diedAt}
              </>
            ) : (<>
             
                <i className="fas fa-home mr-1" />
                {plant.potName}
             
            </>) }
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
