import * as Interactions from "../models/interactionsModel.js";
import * as Tasks from "../models/tasksModel.js";
import { getPhotosByInteraction } from "../models/photosModel.js";

export async function addInteraction(req, res, next) {
    try{
        const { plantId, actionId } = req.query;
        const { note } = req.body;

        if (!actionId) {
            return res.status(400).json({ message: "Missing actionId" });
        }

        // Create the new interaction card for the plant
        const newInteraction = await Interactions.createInteraction(plantId, actionId, note);

        //lookup effects of the action
        const effects = await Interactions.findEffects(actionId);

        for (const effect of effects) {
            //record that this effect was satisfied
            const e = await Interactions.recordEffectCompletion(plantId, effect.effectID, newInteraction.interactionID);
            //mark outstanding tasks completed
            const a = await Tasks.markCompleteByPlantEffect(plantId, effect.effectID);
        }



        res.status(201).json(newInteraction);
    } catch (err) {
        next(err);
    }
}

export async function updateInteractionNote(req, res) {
    try{
        const { id } = req.params;
        const { note } = req.body;

        if (note === undefined) {
            return res.status(400).json({ message: "Note required (can be empty string)." });
        }

        try{
            const result = await Interactions.updateInteractionNote(id, note);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Interaction not found" });
            }
            res.json({message: "Note updated"});
            res.status(200).json(updatedInteraction);
        } catch (err) {
            return res.status(500).json({ message: "Database error", error: err.message }
            )
        }

        
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

export async function deleteInteraction(req, res) {
    try {
        const { id } = req.params;

        const photos = await getPhotosByInteraction(id);
        if (photos.length > 0) {
            return res.status(400).json({ message: "Cannot delete interaction with photos" });
        }

        const result = await Interactions.deleteInteraction(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Interaction not found" });
        }
        res.status(204).json({ message: "Interaction deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}