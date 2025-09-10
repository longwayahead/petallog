import * as QrModel from "../models/qrcodesModel.js";
import {generateLabelPDF} from "../utils/pdfGenerator.js";
import { auth } from "../utils/auth.js";

const CONFIG = {
  showWireframe: false,
  qrScale: 0.75,
  qrOffsetX: 0,
  qrOffsetY: 4,
  textFontSize: 6,
  textOffsetY: -2,
  textOffsetX: 0,
};


function generateString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const results = [];
  for (let j = 0; j < length; j++) {
    let str = "";
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    results.push(str);
  }
  return results;
}


export async function checkQr(req, res, next) {
  try {
    const { code } = req.params;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = session.user.id;

    // check QR exists
    const qr = await QrModel.findQrByCode(code);
    if (!qr) {
      await QrModel.recordScan(code, userId, 0, null, null);
      return res.status(404).json({ valid: false, potId: null, plantId: null  });
    }

    // check linked pot
    const pot = await QrModel.findPotByQr(code);
    if (!pot) {
      await QrModel.recordScan(code, userId, 1, null, null);
      return res.json({ valid: true, potId: null, plantId: null });
    }

    
    // check active plant instance
    const plantInPot = await QrModel.findPlantByPot(pot.pots_id);

    if (plantInPot) {
      await QrModel.recordScan(code, userId, 1, pot.pots_id, plantInPot.plants_id);
      return res.json({
        valid: true,
        potId: pot.pots_id,
        plantId: plantInPot.plants_id,

      });
    } else {
      await QrModel.recordScan(code, userId, 1, pot.pots_id, null);
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

//generate N codes and insert
export async function generateCodes(req, res, next) {
  try {
    const { count = 500 } = req.body;
    const codes = generateString(Number(count));
    const result = await QrModel.insertCodes(codes);
    res.json({
      success: true,
      requested: count,
      inserted: result.inserted,
    })
  } catch (err) {
    next(err);
  }
}

export async function fetchBatch(req,res,next){
  try{
    const {size = 70, offset=0} = req.query;
    const codes = await QrModel.getCodesBatch(Number(size), Number(offset));
    if(!codes.length){
      return res.status(404)
      .json({success:false, message: "No codes found"});
    }

    const batchNumber = Math.floor(offset/size) + 1;
    res.json({success:true, batch: batchNumber, codes, size: codes.length, codes});
  } catch (err) {
    next(err);
  }
}

export async function fetchBatchPdf(req, res, next) {
  try {
    const { size = 70, offset = 0 } = req.query;
    const codes = await QrModel.getCodesBatch(Number(size), Number(offset));

    if (!codes.length) {
      return res
        .status(404)
        .json({ success: false, message: "No codes found" });
    }

    const pdfBytes = await generateLabelPDF(codes, CONFIG);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="batch-${Math.floor(offset / size) + 1}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    next(err);
  }
}