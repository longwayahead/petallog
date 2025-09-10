import * as Effects from "../models/effectsModel.js";

export async function findEffects(req, res) {
    try {
        const effects = await Effects.getEffects();
        res.json(effects);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}