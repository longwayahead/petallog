import * as Actions from "../models/actionsModel.js";

export async function findActions(req, res) {
    try {
        const actions = await Actions.getActions();
        res.json(actions);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}