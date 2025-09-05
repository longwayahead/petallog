import * as QrModel from "../models/qrcodesModel.js";

export async function checkQr(req, res, next) {
  try {
    const { code } = req.params;

    // check QR exists
    const qr = await QrModel.findQrByCode(code);
    if (!qr) {
      return res.status(404).json({ valid: false, potId: null, plantId: null  });
    }

    // check linked pot
    const pot = await QrModel.findPotByQr(code);
    if (!pot) {
      return res.json({ valid: true, potId: null, plantId: null });
    }

    
    // check active plant instance
    const plantInPot = await QrModel.findPlantByPot(pot.id);

    if (plantInPot) {  
      return res.json({
        valid: true,
        potId: pot.pots_id,
        plantId: plantInPot.plants_id,

      });
    } else {
      return res.json({
        valid: true,
        potId: pot.pots_id,
        plantId: null,
      });
    }
  } catch (err) {
    next(err);
  }
}

