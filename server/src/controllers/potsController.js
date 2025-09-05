import * as PotsModel from "../models/potsModel.js";

export async function getPotById(req, res, next) {
    try {
        const potId = req.params.id;
        const pot = await PotsModel.findPotById(potId);
        if (!pot) {
            return res.status(404).json({ error: "Pot not found" });
        }
        res.json(pot);
    } catch (error) {
        next(error);
    }
}

export async function getEmptyPots(req, res, next) {
    try {
        const pots = await PotsModel.findEmptyPots();
        res.json(pots);
    } catch (error) {
        next(error);
    }
}

export async function createPot(req, res, next) {
    try {
        pot = await PotsModel.createPot(req, res, next);
        return pot;
    } catch (error) {
        next(error);
    }
}

export async function assignQRCodeToPot(req, res, next) {
    try {
        console.log("Assigning QR code to pot", req.body);
        const { qrCode, potId } = req.body;
        const result = await PotsModel.assignQRCodeToPot(qrCode, potId);
        console.log(result);
        if (result) {
            res.status(200).json({ message: "QR code successfully assigned to pot" });
        } else {
            res.status(400).json({ message: "Failed to assign QR code to pot" });
        }
    } catch (error) {
        next(error);
    }
}

export async function freePot(req, res, next) {
    try {
        const potId = req.params.id;
        const result = await PotsModel.freePot(potId);
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ message: "Failed to free pot" });
        }
    } catch (error) {
        next(error);
    }
}

