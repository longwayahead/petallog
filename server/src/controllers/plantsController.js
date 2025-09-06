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