import * as Plants from "../models/plantsModel.js";

export async function getPlants(req, res, next) {
  try {
    const plants = await Plants.findAllPlants();
    res.json(plants);
  } catch (err) {
    next(err);
  }
}

export async function getPlant(req, res, next) {
  try {
    const plant = await Plants.findPlant(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    res.json(plant);
  } catch (err) {
    next(err);
  }
}

export async function updatePlant(req, res, next) {
  try {
    const plantId = req.params.id;
    const { friendly_name, species, acquired_at, acquired_from, notes, foods_id } = req.body;
    // console.log(plantId, req.body);

    const updated = await Plants.updatePlant(plantId, {
      friendly_name,
      species,
      acquired_at,
      acquired_from,
      notes,
      foods_id,
    });
    if (updated) {
      const plant = await Plants.findPlant(plantId);
      res.json(plant);
    } else {
      res.status(404).json({ message: "Plant not found" });
    }
  } catch (err) {
    next(err);
  }
}

export async function getPendingTasks(req, res, next) {
  try {
    const tasks = await Plants.findPendingTasks(req.params.id);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getCarePreferences(req, res, next) {
  try {
    const preferences = await Plants.findCarePreferences(req.params.id);
    res.json(preferences);
  } catch (err) {
    next(err);
  }
}

export async function getInteractions(req, res, next) {
  try {
    const interactions = await Plants.findInteractions(req.params.id);
    res.json(interactions);
  } catch (err) {
    next(err);
  }
}

export async function getMaxInteractionid(req, res, next) {
    try {
      const maxId = await Plants.findMaxInteractionId(req.params.id);
      res.json(maxId);
    } catch (err) {
      next(err);
    }
}

export const setProfilePhoto = async(req,res,next) => {
    try{
        const photo = await Plants.setProfilePhoto(req.params.plantId, req.params.photoId);
        if (photo) {
          const plant = await Plants.findPlant(req.params.plantId);
          res.json(plant);
        }
    } catch (err) {
        next(err);
    }
}

export const killPlant = async(req,res,next) => {
    try{
        const killed = await Plants.killPlant(req.params.plantId);
        if (killed) {
          res.status(200).json({ message: "Plant killed successfully" });
        } else {
          res.status(404).json({ message: "Plant not found" });
        }
    } catch (err) {
        next(err);
    }
}

export async function assignPlantPot(req, res, next) {
    try{
        const plantId = req.params.plantId;
        const { potId } = req.body;
        console.log(plantId, potId);
        const result = await Plants.assignPlantPot(plantId, potId);
        if(result) {
          const plant = await Plants.findPlant(plantId);
          res.status(200).json(plant);
        } else {
            res.status(400).json({ message: "Failed to assign plant pot" });
        }
    } catch (error) {
        next(error);
    }
}

export async function addPlant(req, res, next) {
  try {
    const { plantName, species, acquiredAt, acquiredFrom, plantNotes, foodId, photoId, potId} = req.body;

    const newPlant = await Plants.createPlant({
      plantName,
      species,
      acquiredAt,
      acquiredFrom,
      plantNotes,
      foodId,
      photoId,
      potId,
    });
    res.status(201).json(newPlant);
  } catch (err) {
    next(err);
  }
}

export async function addCarePreference(req, res, next) {
  try {
    const { effectID, frequencyDays } = req.body;
    const plantId = req.params.plantId;

    const newPref = await Plants.addCarePreference(plantId, effectID, frequencyDays);
    res.status(201).json(newPref);
  } catch (err) {
    next(err);
  }
}

export async function updateCarePreference(req, res, next) {
  try {
    const { plantsEffectsID, frequencyDays } = req.body;
    const plantId = req.params.plantId;

    const updated = await Plants.updateCarePreference(plantId, plantsEffectsID, frequencyDays);
    if (!updated) return res.status(404).json({ message: "Preference not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteCarePreference(req, res, next) {
  try {
    const { plantsEffectsID } = req.body;
    const plantId = req.params.plantId;

    const deleted = await Plants.deleteCarePreference(plantId, plantsEffectsID);
    if (!deleted) return res.status(404).json({ message: "Preference not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
